#!/bin/bash

# --- CONFIGURATION ---
TOKEN="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"
PARENT_PAGE_ID="3435a582bdae80f58b73edbf99939776"

echo "🚀 开始部署 Notion 专业保险 CRM v2.0..."

# 1. Create Clients Database
echo "📦 创建数据库: 👥 客户名单..."
CLIENTS_JSON=$(curl -s -X POST "https://api.notion.com/v1/databases" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Notion-Version: 2022-06-28" \
  --data '{
    "parent": { "type": "page_id", "page_id": "'$PARENT_PAGE_ID'" },
    "icon": { "type": "emoji", "emoji": "👥" },
    "title": [{ "type": "text", "text": { "content": "👥 客户名单" } }],
    "properties": {
      "姓名": { "title": {} },
      "状态": { "select": { "options": [
        { "name": "潜在客户 (Lead)", "color": "blue" },
        { "name": "正式客户 (Active)", "color": "green" },
        { "name": "不活跃 (Inactive)", "color": "gray" }
      ]}},
      "跟进优先级": {"select": {"options": [
        {"name": "🔥 紧急", "color": "red"},
        {"name": "🟡 普通", "color": "yellow"},
        {"name": "⚪️ 低", "color": "gray"}
      ]}},
      "手机号": { "phone_number": {} },
      "上次跟进时间": { "date": {} },
      "下次跟进日期": { "date": {} }
    }
  }')

CLIENTS_ID=$(echo $CLIENTS_JSON | jq -r '.id')

if [ "$CLIENTS_ID" == "null" ] || [ -z "$CLIENTS_ID" ]; then
  echo "❌ 创建客户名单失败: $CLIENTS_JSON"
  exit 1
fi
echo "✅ 客户名单创建成功! (ID: $CLIENTS_ID)"

# 2. Create Policies Database
echo "📦 创建数据库: 📄 保单管理..."
curl -s -X POST "https://api.notion.com/v1/databases" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Notion-Version: 2022-06-28" \
  --data '{
    "parent": { "type": "page_id", "page_id": "'$PARENT_PAGE_ID'" },
    "icon": { "type": "emoji", "emoji": "📄" },
    "title": [{ "type": "text", "text": { "content": "📄 保单管理" } }],
    "properties": {
      "保单名称": { "title": {} },
      "保险公司": { "select": { "options": [
        { "name": "友邦 AIA", "color": "red" },
        { "name": "保诚 Prudential", "color": "blue" },
        { "name": "理财 (Manulife)", "color": "green" }
      ]}},
      "年缴保费": { "number": { "format": "currency" } },
      "生效日期": { "date": {} },
      "续期日期": { "date": {} },
      "客户": { "relation": { "database_id": "'$CLIENTS_ID'", "single_property": {} } }
    }
  }' > /dev/null

# 3. Create Interactions Database
echo "📦 创建数据库: 📝 跟进记录..."
curl -s -X POST "https://api.notion.com/v1/databases" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Notion-Version: 2022-06-28" \
  --data '{
    "parent": { "type": "page_id", "page_id": "'$PARENT_PAGE_ID'" },
    "icon": { "type": "emoji", "emoji": "📝" },
    "title": [{ "type": "text", "text": { "content": "📝 跟进记录" } }],
    "properties": {
      "跟进主题": { "title": {} },
      "日期": { "date": {} },
      "跟进方式": { "select": { "options": [
        { "name": "面谈", "color": "purple" },
        { "name": "电话", "color": "blue" },
        { "name": "微信", "color": "green" }
      ]}},
      "客户": { "relation": { "database_id": "'$CLIENTS_ID'", "single_property": {} } }
    }
  }' > /dev/null

# 4. Create Claims Database
echo "📦 创建数据库: 💸 理赔追踪..."
curl -s -X POST "https://api.notion.com/v1/databases" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Notion-Version: 2022-06-28" \
  --data '{
    "parent": { "type": "page_id", "page_id": "'$PARENT_PAGE_ID'" },
    "icon": { "type": "emoji", "emoji": "💸" },
    "title": [{ "type": "text", "text": { "content": "💸 理赔追踪" } }],
    "properties": {
      "理赔事项": { "title": {} },
      "理赔状态": { "select": { "options": [
        { "name": "资料收集", "color": "gray" },
        { "name": "审核中", "color": "yellow" },
        { "name": "已获赔", "color": "green" },
        { "name": "被拒绝", "color": "red" }
      ]}},
      "理赔金额": { "number": { "format": "currency" } },
      "报案日期": { "date": {} },
      "客户": { "relation": { "database_id": "'$CLIENTS_ID'", "single_property": {} } }
    }
  }' > /dev/null

echo "🎉 部署全部完成！请刷新您的 Notion 页面查看。"
