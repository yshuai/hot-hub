import type { SourceConfig } from "./types";

/**
 * DailyHotApi 实例(imsyy/DailyHotApi)。
 * 公共实例仅作演示,建议 Vercel 一键部署 imsyy/DailyHotApi-Vercel 后,
 * 在环境变量 DAILYHOT_API_BASE 里换成自己的地址。
 */
export const DAILYHOT_API_BASE =
  process.env.DAILYHOT_API_BASE ?? "https://api-hot.imsyy.top";

/**
 * RSSHub 实例。头条账号(/toutiao/user/token/:token)、抖音博主(/douyin/user/:uid)
 * 等反爬路由在公共实例上不稳定,建议 Docker 自建后通过环境变量 RSSHUB_BASE 覆盖。
 */
export const RSSHUB_BASE = process.env.RSSHUB_BASE ?? "https://rsshub.app";

/**
 * 信源清单:增删改这里即可,页面与 /api/feed 自动跟随。
 * kind=dailyhot → 调 DailyHotApi;kind=rss → 通用 RSS 解析。
 */
export const SOURCES: SourceConfig[] = [
  // ── 热榜(DailyHotApi 还有微博/知乎/快手等 60+ 路由,按需增删)────────
  { id: "douyin", name: "抖音热榜", group: "热榜", kind: "dailyhot", route: "douyin", home: "https://www.douyin.com/hot" },
  { id: "toutiao", name: "今日头条", group: "热榜", kind: "dailyhot", route: "toutiao", home: "https://www.toutiao.com/" },
  { id: "weibo", name: "微博热搜", group: "热榜", kind: "dailyhot", route: "weibo", home: "https://s.weibo.com/top/summary" },
  { id: "bilibili", name: "哔哩哔哩", group: "热榜", kind: "dailyhot", route: "bilibili", home: "https://www.bilibili.com/v/popular/rank/all" },

  // ── 开源趋势 ──────────────────────────────────────────────
  { id: "github", name: "GitHub Trending", group: "开源趋势", kind: "dailyhot", route: "github", home: "https://github.com/trending" },

  // ── AI·科技 ───────────────────────────────────────────────
  { id: "hackernews", name: "Hacker News", group: "AI·科技", kind: "dailyhot", route: "hackernews", home: "https://news.ycombinator.com/" },
  { id: "36kr", name: "36氪快讯", group: "AI·科技", kind: "dailyhot", route: "36kr", home: "https://36kr.com/newsflashes" },

  // ── 账号订阅(改成你自己的地址后把 enabled 改为 true)────────────────
  // 头条账号:token 从作者主页 URL 取,如 https://www.toutiao.com/c/user/token/MS4wLjABAAAAxxxx/
  {
    id: "toutiao-account",
    name: "头条账号",
    group: "账号订阅",
    kind: "rss",
    enabled: false,
    url: `${RSSHUB_BASE}/toutiao/user/token/MS4wLjABAAAA替换成你的token`,
    home: "https://www.toutiao.com/",
  },
  // 微信公众号:wewe-rss(Docker 自建)或 we-mp-rss 生成的 RSS 地址
  {
    id: "wechat-mp",
    name: "微信公众号",
    group: "账号订阅",
    kind: "rss",
    enabled: false,
    url: "https://你的-wewe-rss-实例/feed/公众号id",
  },
];
