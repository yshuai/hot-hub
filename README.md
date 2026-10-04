# Hot Hub · 热点聚合站

抖音 / 今日头条 / 微博热榜、GitHub Trending、AI 资讯、以及**自定义账号订阅**(头条账号、微信公众号)的统一聚合站。Next.js + Tailwind 实现,一键部署 Vercel,零数据库、零运维。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yshuai/hot-hub)

## 功能

- **首页分组展示**:热榜 / 开源趋势 / AI·科技 / 账号订阅,每源 Top 30,ISR 缓存 10 分钟
- **统一 RSS 输出**:`/api/feed` 把所有信源合成一条 feed,可在任意 RSS 阅读器订阅
- **每日日报归档**:GitHub Actions 每天 08:00(北京时间)生成 `daily/YYYY-MM-DD.md` 并自动提交
- **信源配置化**:增删信源只改 `lib/sources.ts`,两类适配器开箱即用:
  - `dailyhot`:接 [DailyHotApi](https://github.com/imsyy/DailyHotApi)(60+ 平台热榜)
  - `rss`:通用 RSS(RSSHub、wewe-rss、AIHOT、GitHubTrendingRSS 等一切 feed)

## 快速开始

```bash
npm install
npm run dev        # http://localhost:3000
```

## 部署到 Vercel

点击上面的 **Deploy** 按钮,或:

```bash
npm i -g vercel
vercel --prod
```

可选环境变量:

| 变量 | 默认 | 说明 |
|---|---|---|
| `DAILYHOT_API_BASE` | `https://api-hot.imsyy.top` | DailyHotApi 实例地址。公共实例仅作演示,**建议 Vercel 一键部署 [imsyy/DailyHotApi-Vercel](https://github.com/imsyy/DailyHotApi-Vercel) 后换成自己的** |
| `RSSHUB_BASE` | `https://rsshub.app` | RSSHub 实例,用于账号订阅类路由 |
| `NEXT_PUBLIC_SITE_URL` | 自动 | 站点对外地址,用于 RSS `<link>` |

## 监控订阅账号(头条 / 公众号 / 抖音)

账号类信源没有官方 API,统一做法:**转成 RSS → 填进 `lib/sources.ts` → 把 `enabled` 改为 `true`**。

### 今日头条账号

1. 打开作者主页,URL 形如 `https://www.toutiao.com/c/user/token/MS4wLjABAAAAxxxx/`,复制 token;
2. RSS 路由:`{RSSHUB_BASE}/toutiao/user/token/<token>`;
3. 注意:该路由带 a_bogus 反爬签名,公共实例经常失败,**建议 Docker 自建 RSSHub**:

```bash
docker run -d --name rsshub -p 1200:1200 diygod/rsshub
# 然后 RSSHUB_BASE=http://localhost:1200(或部署公网后填地址)
```

### 微信公众号

两条路任选:

- [wewe-rss](https://github.com/cooderl/wewe-rss)(9.7k★):基于微信读书,Docker 自建,生成 `/feed/{公众号id}`;
- [we-mp-rss](https://github.com/rachelos/we-mp-rss)(4.8k★):定时更新 + RSS/Webhook/API,功能更全。

拿到 RSS 地址填进 `lib/sources.ts` 的 `wechat-mp` 条目即可。

### 抖音博主

RSSHub 路由:`{RSSHUB_BASE}/douyin/user/<uid>`(uid 从博主主页 URL 取,`MS4wLjABAAAA` 开头,需要带 puppeteer 的镜像)。

## 每日日报

- 自动:仓库的 GitHub Actions(`daily digest` workflow)每天 UTC 00:00 运行,归档到 `daily/`,推石头自动重部署;
- 手动:`npm run daily`(源在 `scripts/daily.mjs` 的 `HOT_ROUTES` / `RSS_SOURCES` 里配置)。

## 目录结构

```
app/
  page.tsx            # 首页:按分组渲染全部信源
  api/feed/route.ts   # 聚合 RSS 输出
lib/
  sources.ts          # ★ 信源清单:加源/删源/开关都在这里
  adapters.ts         # dailyhot / rss 两类抓取适配器
  fetchAll.ts         # 并发抓取,单源失败不影响整体
scripts/daily.mjs     # 每日日报生成(Actions 定时跑)
.github/workflows/daily.yml
```

## 免责声明

本项目仅聚合公开接口与 RSS 内容用于个人阅读,不存储原文;各榜单版权归原平台所有。爬取类信源请遵守目标网站条款,控制频率。
