import json
import urllib.request
import urllib.error
import time

# --- CONFIGURATION ---
NOTION_API_URL = "https://api.notion.com/v1"
NOTION_VERSION = "2022-06-28"

def print_header():
    print("\n" + "="*60)
    print("🚀 专业保险 CRM Notion 自动化部署工具 v2.0")
    print("功能：包含客户、保单、跟进管理及理赔追踪")
    print("="*60 + "\n")

def call_notion(endpoint, token, method="POST", data=None):
    url = f"{NOTION_API_URL}/{endpoint}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Notion-Version": NOTION_VERSION
    }
    
    req = urllib.request.Request(url, headers=headers, method=method)
    if data:
        json_data = json.dumps(data).encode("utf-8")
        req.data = json_data

    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"❌ API 错误: {e.code} - {error_body}")
        return None
    except Exception as e:
        print(f"❌ 发生错误: {e}")
        return None

def create_database(token, parent_page_id, title, properties, icon="📋"):
    print(f"📦 正在创建数据库: {title}...")
    data = {
        "parent": {"type": "page_id", "page_id": parent_page_id},
        "icon": {"type": "emoji", "emoji": icon},
        "title": [{"type": "text", "text": {"content": title}}],
        "properties": properties
    }
    res = call_notion("databases", token, data=data)
    if res:
        print(f"✅ {title} 创建成功!")
        return res["id"]
    return None

def main():
    print_header()
    
    # Pre-defined credentials found in environment (optional)
    default_token = "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"
    default_page_id = "3435a582bdae80f58b73edbf99939776"

    token = input(f"1. 请输入您的 Notion Token (回车默认: {default_token[:10]}...): ").strip() or default_token
    page_id = input(f"2. 请输入目标页面 ID (回车默认: {default_page_id[:10]}...): ").strip() or default_page_id
    
    if not token or not page_id:
        print("❌ Token 或页面 ID 不能为空。")
        return

    # 1. Create Clients Database
    print("\n--- 正在构建数据库架构 ---")
    clients_props = {
        "姓名": {"title": {}},
        "状态": {"select": {"options": [
            {"name": "潜在客户 (Lead)", "color": "blue"},
            {"name": "正式客户 (Active)", "color": "green"},
            {"name": "不活跃 (Inactive)", "color": "gray"}
        ]}},
        "跟进优先级": {"select": {"options": [
            {"name": "🔥 紧急", "color": "red"},
            {"name": "🟡 普通", "color": "yellow"},
            {"name": "⚪️ 低", "color": "gray"}
        ]}},
        "手机号": {"phone_number": {}},
        "生日": {"date": {}},
        "上次跟进时间": {"date": {}},
        "下次跟进日期": {"date": {}},
        "主要需求": {"multi_select": {"options": [
            {"name": "人寿保障", "color": "red"},
            {"name": "健康医疗", "color": "green"},
            {"name": "储蓄增值", "color": "blue"},
            {"name": "养老金", "color": "orange"}
        ]}}
    }
    clients_db_id = create_database(token, page_id, "👥 客户名单", clients_props, "👥")
    if not clients_db_id: return

    # 2. Create Policies Database
    policies_props = {
        "保单名称": {"title": {}},
        "保险公司": {"select": {"options": [
            {"name": "友邦 AIA", "color": "red"},
            {"name": "保诚 Prudential", "color": "blue"},
            {"name": "理财 (Manulife)", "color": "green"}
        ]}},
        "年缴保费": {"number": {"format": "currency"}},
        "生效日期": {"date": {}},
        "续期日期": {"date": {}},
        "客户": {"relation": {"database_id": clients_db_id, "single_property": {}}}
    }
    create_database(token, page_id, "📄 保单管理", policies_props, "📄")

    # 3. Create Interactions Database
    interactions_props = {
        "跟进主题": {"title": {}},
        "日期": {"date": {}},
        "跟进方式": {"select": {"options": [
            {"name": "面谈", "color": "purple"},
            {"name": "电话", "color": "blue"},
            {"name": "微信", "color": "green"},
            {"name": "活动", "color": "orange"}
        ]}},
        "沟通内容摘要": {"rich_text": {}},
        "客户": {"relation": {"database_id": clients_db_id, "single_property": {}}}
    }
    create_database(token, page_id, "📝 跟进记录", interactions_props, "📝")

    # 4. Create Claims Tracking Database (NEW)
    claims_props = {
        "理赔事项": {"title": {}},
        "理赔状态": {"select": {"options": [
            {"name": "资料收集", "color": "gray"},
            {"name": "审核中", "color": "yellow"},
            {"name": "已获赔", "color": "green"},
            {"name": "被拒绝", "color": "red"}
        ]}},
        "预计/理赔金额": {"number": {"format": "currency"}},
        "报案日期": {"date": {}},
        "客户": {"relation": {"database_id": clients_db_id, "single_property": {}}}
    }
    create_database(token, page_id, "💸 理赔追踪", claims_props, "💸")

    # 5. Create Opportunities Database
    opps_props = {
        "业务机会名称": {"title": {}},
        "销售阶段": {"status": {"options": [
            {"name": "初步沟通", "color": "default"},
            {"name": "方案制定", "color": "blue"},
            {"name": "建议书宣讲", "color": "purple"},
            {"name": "等待签单", "color": "yellow"},
            {"name": "已成交", "color": "green"}
        ]}},
        "预计保费": {"number": {"format": "currency"}},
        "客户": {"relation": {"database_id": clients_db_id, "single_property": {}}}
    }
    create_database(token, page_id, "🎯 销售漏斗", opps_props, "🎯")

    print("\n" + "✨"*30)
    print("🎉 恭喜！您的专业保险 CRM 架构已成功部署至 Notion。")
    print("✨"*30)
    print("\n📬 下一步建议：")
    print("1. 🎨 界面优化：在 Notion 中将数据库视图切换为 'Gallery' 或 'Board'。")
    print("2. 📊 访问系统：立刻打开您的全新管理后台：")
    print("   👉 https://slgsolver.github.io/insurance-crm/")
    print("3. 🧪 自动化公式：请参考 'notion_formulas.md' 配置智能提醒。")
    print("\n" + "="*60)

if __name__ == "__main__":
    main()
