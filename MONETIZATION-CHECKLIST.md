# Fake Break 变现落地清单（内部操作文档）

> 目标：让网站产生收益，且收益 100% 进我们自己的账户。
> 现状：双轨解锁已上线——看广告解锁 + $1 支持者通行证（一次付费全解锁）。
> 本文档按阶段推进，每步标注【你做】/【我做】/【一起做】。

---

## 阶段 0 · 现在已经有的（无需操作）

- ✅ 广告解锁完整流程：Main Character / Paper Trail / Gaslight / Midnight Snack / Old Money 五款烟盒，6 秒激励广告插页
- ✅ 支持者通行证：每款广告烟盒都带 $1 付费选项，一次付费解锁全部烟盒（回跳 `?supporter=all` 自动解锁）
- ✅ 广告接入点：`src/monetization.ts`，拿到真实广告 ID 后改两行即可切换
- ✅ 自定义域名 + HTTPS：fakebreak.win 已上线
- ✅ Privacy / About 页面：AdSense 审核硬性材料已就位

---

## 阶段 1 · 买域名 ~~【你做，约 15 分钟，¥60–90/年】~~ ✅ 已完成：fakebreak.win（Cloudflare）

**为什么必须买**：广告平台几乎不批 `github.io` 这类子域名；域名是收益资产的产权证明。

1. 选注册商：
   - **Cloudflare Registrar**：成本价、免费隐私保护，需要国际信用卡或 PayPal（推荐）
   - **Porkbun / Namecheap**：便宜易用，支持支付宝的少，主要用卡
   - **阿里云/腾讯云**：支持支付宝微信，但需实名认证（个人身份证即可）
2. 挑名字：查 `fakebreak.com / fake-break.app / fakebreak.lol / fakebreak.fun` 等可用性
   - `.app` 强制 HTTPS（GitHub Pages 自动提供证书，无额外成本）
   - 避免生僻后缀，广告审核对主流后缀更友好
3. 买下后**把域名告诉我**，阶段 2 的仓库侧配置我来做

> ⚠️ 注意：不要自己往仓库里加 CNAME 文件——我们的构建会清空 `docs/` 目录，
> 放错位置会导致下次发布时配置丢失甚至线上中断。正确位置是 `public/CNAME`，我来加。

---

## 阶段 2 · DNS 接入 GitHub Pages【一起做，约 30 分钟 + 生效等待】

顺序很重要：**先配 DNS，再在 GitHub 填域名**（GitHub 会即时校验解析记录）。

1. 【你做】在注册商 DNS 面板添加记录（以 `fakebreak.com` 为例）：

   | 类型 | 名称 | 值 |
   |---|---|---|
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |
   | CNAME | www | superchenbotao.github.io |

   - Cloudflare 用户可改用一条 CNAME 拉平（@ → superchenbotao.github.io，关闭橙色代理云）
   - 不要加 `*.域名` 通配记录（有域名劫持风险）
2. 【我做】仓库侧：创建 `public/CNAME`（内容一行：你的域名），更新 `vite.config.ts`
   里的 `productionUrl`，重新构建推送
3. 【你做】GitHub 仓库 → Settings → Pages → Custom domain 填域名 → Save，
   等 DNS 检查变绿（通常 5 分钟～24 小时）
4. 【你做】勾选 **Enforce HTTPS**（证书由 Let's Encrypt 自动签发，可能需等几小时）
5. 【一起做】验证 `https://你的域名` 和 `https://www.你的域名` 都正常打开

---

## 阶段 3 · 广告平台申请前的补课【我做为主，1 天内】

广告审核要求"有实质内容的正规网站"，目前单页玩具形态有被拒风险，需要补：

1. ~~【我做】隐私政策页（`/privacy`）~~ ✅ 已完成：`?page=privacy`，含 Cookie/个性化广告声明
2. ~~【我做】About / Contact 页~~ ✅ 已完成：`?page=about`，页脚直达入口
3. 【我做】`ads.txt` 就位机制——拿到广告 ID 后一行配置
4. 【你做】心态准备：审核数天～4 周；被拒可根据理由修改后重复申请

---

## 阶段 4 · 申请广告平台【你做申请，我做接入】

### 路线 A：Google AdSense（推荐首选，广告质量高、按月打款）

1. 【你做】adsense.google.com 注册（需满 18 岁 + Google 账户 + 一个收款银行账户）
2. 【你做】添加站点域名，拿到验证代码片段
3. 【我做】把验证代码放进 `index.html` 的 `<head>`，重新部署
4. 【你做】等待审核（数天～4 周）
5. 通过后【一起做】开通 Auto Ads（锚定/穿插广告），按页面浏览量计费

> ⚠️ 政策红线：普通 AdSense 展示广告**不允许**"看广告换解锁"这种激励观看模式。
> 所以上线 AdSense 后，烟盒解锁插页里的广告位保持模拟/赞助内容样式，
> 真实收入来自 Auto Ads 的页面广告——两条线并行，互不违规。

### 路线 B：H5 游戏激励广告（真正的"看广告解锁"，有门槛）

- Google 的 Ad Placement API（`adBreak`/`adConfig`）支持网页激励广告，
  但当前为 **closed beta**：要求网站上有真实可玩的 H5 游戏、账号与域名双重审核
- 我们的广告插页代码结构已按 `adBreak` 模式预留，获批后可直接切换
- 第三方激励网络（Monetag / Adsterra 等）门槛低、周结，但广告质量较差，
  建议作为 AdSense 被拒后的备选

### 路线 C（已内置，当天可收款）：直接付款，零审核

- ✅【已完成】Old Money 烟盒弹层已带金色 "Supporter unlock · $1" 按钮，
  与看广告并列（"or skip the line"）
- ✅【已完成】支付回跳自解锁：Stripe 付款成功跳回 `/?supporter=old-money`
  即自动解锁 + 庆祝提示；localStorage 永久记住支持者身份
- 【你做】注册 **Ko-fi** 或创建 **Stripe Payment Link**（5 分钟，$1 一次性付款）
  把链接发我（或自己填进 `src/monetization.ts` 的 `SUPPORT_CONFIG.paymentUrl`）
- 【你做】仅 Stripe：把 Payment Link 的 after-payment 跳转设为
  `https://你的域名/?supporter=old-money`
- 分成 ~97%，直达你的账户——到账最快、无审核的变现方式

---

## 阶段 5 · 放大流量（收益 = 流量 × 转化率）

1. 分享解锁文案已内置传播钩子；可把解锁截图发到 Reddit r/quitsmoking、
   ProductHunt、TikTok（"戒烟神器但是假的"自带话题性）
2. ProductHunt 上线日我可以帮你准备文案和素材
3. 观察数据：加一个隐私友好的统计（如 Cloudflare Web Analytics，免费无 Cookie）
   【我做，一行脚本】

---

## 时间线预估

| 节点 | 耗时 | 卡点 |
|---|---|---|
| 域名+DNS 上线 | 半天～1 天 | DNS 生效等待 |
| 隐私/About 页补齐 | 我半天 | 无 |
| AdSense 审核 | 数天～4 周 | 内容完整度 |
| Ko-fi/Stripe 收款 | 当天 | 无 |
| 第一笔收入 | 路线 C 最快当天可行 | 流量 |
