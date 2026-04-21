# Notion 智能跟进公式指南

为了让您的 CRM 真正“智能”，建议在 **👥 客户名单** 数据库中手动添加以下公式属性。

### 1. 跟进状态提醒 (Follow-up Status)
**用途**：根据“上次跟进时间”和“跟进优先级”自动计算当前状态。
**复制以下代码到公式属性：**

```javascript
ifs(
    empty(prop("下次跟进日期")), "⚪️ 待定",
    dateBetween(prop("下次跟进日期"), now(), "days") < 0, "🔴 逾期需跟进",
    dateBetween(prop("下次跟进日期"), now(), "days") == 0, "🔥 今日需联络",
    dateBetween(prop("下次跟进日期"), now(), "days") <= 3, "🟡 准备跟进",
    "🟢 状态良好"
)
```

---

### 2. 生日倒计时 (Birthday Countdown)
**用途**：提醒您客户的生日，方便发祝词。
**复制以下代码到公式属性：**

```javascript
if(empty(prop("生日")), "", 
    let(
        nextBDay, dateAdd(prop("生日"), year(now()) - year(prop("生日")) + (if(dateBetween(dateAdd(prop("生日"), year(now()) - year(prop("生日")), "years"), now(), "days") < 0, 1, 0)), "years"),
        days, dateBetween(nextBDay, now(), "days"),
        ifs(
            days == 0, "🎂 今天生日！",
            days <= 7, "🎁 还有 " + format(days) + " 天生日",
            "📅 还有 " + format(days) + " 天"
        )
    )
)
```

---

### 3. 如何配置“跟进看板”？
为了高效跟进客户，建议在 Notion 中创建一个 **Board (看板) 视图**：
1.  点击数据库顶部的 `+` 号。
2.  选择 `Board`。
3.  在 `Group by` 中选择 `跟进优先级` 或 `状态`。
4.  在 `Filter` 中设置：`跟进状态提醒` 包含 `🔴 逾期需跟进` 或 `🔥 今日需联络`。

这样，您每天一打开 Notion 就能看到**必须要联系**的客户名单了！
