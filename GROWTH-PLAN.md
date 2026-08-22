# Fake Break 运营投流方案（内部文档）

> 目标：把 fakebreak.win 做成一个自我增长的流量资产。
> 变现底座：展示广告（A-Ads 已上线）+ $1 支持者通行证（Ko-fi 已接通）。
> 本文档分四部分：增长漏斗 → 免费流量打法 → 付费投流方案 → 节奏与风控。

---

## 一、增长漏斗（我们卖的是什么）

```
发现（帖子/短视频/搜索）
  → 首访（首页 3 秒讲清"假烟戒烟"）
    → 第一次仪式（Take one / SOS 一键直达）
      → 成瘾循环（streak + 烟盒收集 + 徽章 + 身体恢复时间线）
        → 传播（战绩分享卡片"Pass it on"）
        → 变现（看广告解锁 / $1 通行证）
```

**核心指标（每周记录一次）：**

| 指标 | 目标（上线 3 个月内） | 怎么测 |
|---|---|---|
| 周独立访客 | 1,000 → 5,000 | Cloudflare Web Analytics（免费无 Cookie，建议加） |
| 首访→完成首次仪式转化率 | >30% | 目前无后端，用广告展示数/访客数近似 |
| 7 日留存 | >15% | 依赖 streak 回访，定性观察 |
| 广告展示收入/RPM | 跑 2 周看基线 | A-Ads 后台 |
| 通行证转化率 | 1-3%（变现站点常见区间） | Ko-fi 后台 |

---

## 二、免费流量（现在就能做，审核期正是攒流量的窗口）

### 1. Reddit（首选，社区文化契合度最高）

- **r/quitsmoking、r/stopsmoking**：发"成果型"帖子，不是广告帖
  - 模板："I kept reaching for cigarettes out of habit, so I built a website that lets you smoke a fake one. It burns when you blow into the mic. 30 days smoke-free today."
- **r/InternetIsBeautiful、r/webdev、r/SideProject**：发"作品型"帖子
  - 模板："I built a fake cigarette you can smoke in your browser"
- 节奏：每周 1-2 帖，不同社区错开；前 2 小时的回复必须逐条回（Reddit 算法看早期互动）
- ⚠️ 不要硬广腔；账号先养 1-2 周正常发言再发

### 2. TikTok / Instagram Reels / YouTube Shorts（流量天花板最高）

- 内容形式：录屏 15-30 秒——点烟、吹气烟头燃烧变红、弹灰、吐烟圈，配文 "this fake cigarette is helping me quit"
- 钩子前三秒："POV: you quit smoking but your hands didn't"
- 评论区置顶链接；bio 挂 fakebreak.win
- 频率：每周 3 条，不同角度（仪式感 ASMR / 戒烟故事 / 搞笑"最贵的假烟"开箱）

### 3. X / Twitter

- 战绩分享按钮已内置"#FakeBreak"文案；自己账号发"戒烟日记"系列
- 蹭 #quitsmoking #SoberCurious 话题

### 4. Product Hunt（一次性大曝光，广告已上线，随时可做）

- 过审后再发：审核员和 PH 用户会互相放大可信度
- 发布日前准备好：OG 图、3 张截图、首条评论（maker comment）、邀请朋友当天 upvote

### 5. SEO（长尾复利）

- 已完成：FAQ 结构化数据、meta/OG 标签、真实内容板块
- 目标词："fake cigarette to quit smoking"、"smoking ritual replacement"、"craving timer"
- 后续可加：博客式页面（如 "The 90-second craving wave, explained"），每篇都是搜索入口

---

## 三、付费投流（⚠️ 时机：先跑 2 周免费流量拿到 RPM 基线，再决定是否花一分钱）

### 为什么必须等过审

现在的变现只有 $1 通行证，转化率按 2% 算，**每个访客的期望收入 ≈ $0.02**。
而任何平台的买量成本都是 $0.10-1.00/点击——买即亏。
付费投流只在"广告收入 > 买量成本"（流量套利）成立时才有意义，那需要先有 A-Ads 的 RPM 数据（A-Ads 后台实时可查）。

### 套利数学（过审后先用免费流量测出 RPM，再决定是否付费）

```
每个解锁广告展示收入（激励视频 RPM 参考）：$3-15 / 千次展示
假设：30% 访客看 1 次解锁广告，RPM $8
→ 每访客广告收入 ≈ $0.0024 + 通行证 $0.02 ≈ $0.022
→ 只有当 CPC < $0.02 时套利成立——这在主流平台（Google/Meta）几乎不可能
→ 结论：本项目的付费投流只适合"低价猎奇流量"，不适合常规竞价
```

### 如果测出来值得投，渠道优先级

1. **Reddit Ads**：可定向 r/quitsmoking，CPM 低（$0.5-2），社区氛围符合
2. **TikTok Spark Ads**：先自己发短视频，哪条自然流量爆了就给哪条加 $50 助推——只投已验证的内容
3. **Google Ads 品牌词防守**：不需要，没人搜我们
4. ❌ 避免：任何"戒烟/烟草"关键词竞价——CPC 贵（$1-5）且广告审核对 tobacco-adjacent 词敏感，我们的落地页反而可能被误判

### 预算梯度（仅过审后）

| 阶段 | 月预算 | 用途 |
|---|---|---|
| 测试期 | $50-100 | Spark Ads 助推已验证的爆款短视频 |
| 放量期 | $200-500 | 仅当 CPA 数据证明回本周期 < 30 天 |
| 止损线 | 任何渠道连亏 2 周即停 | 宁可不投，不做慈善 |

---

## 四、节奏与风控

### 每周运营节奏（建议）

- 周一：发 1 条 Reddit 帖（轮换社区）
- 周三/五/日：各发 1 条短视频
- 周日：记录核心指标（10 分钟），复盘哪条内容带来流量

### 成瘾性设计（已内置，运营时强化）

- Streak 连续天数 → 内容里强调"Day N smoke-free"打卡文化
- 烟盒收集 → 定期出新烟盒（每月 1 款，节日限定款是天然的再传播素材）
- 徽章/身体恢复时间线 → 截图分享素材

### 风险清单

| 风险 | 应对 |
|---|---|
| A-Ads 广告填充率低/收益低 | 免审核无拒审风险；收益随流量与广告主出价浮动，先跑基线再优化 |
| 被误判为烟草推广 | 全站保持"戒烟辅助"叙事；FAQ 和 About 已声明 |
| 流量套利亏损 | 严格执行止损线；先免费流量验证 RPM |
| 单一渠道依赖 | Reddit + 短视频 + SEO 三条腿，不把鸡蛋放一个篮子 |

---

*下一步：A-Ads 广告已上线（广告位 2452940）→ 在 A-Ads 后台填 BTC 收款地址 → 跑 2 周免费流量测 RPM 基线 → 再评估是否启动付费投流。*
