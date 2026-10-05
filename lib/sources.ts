import type { SourceConfig } from "./types";

/**
 * DailyHotApi 实例(imsyy/DailyHotApi),供 kind=dailyhot 的源使用。
 * 注意:公共实例 api-hot.imsyy.top 已下线;抖音/微博/B站等源需要
 * 自建实例(Vercel 一键部署 imsyy/DailyHotApi-Vercel 或 Docker)后启用。
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
 *
 * 默认源全部为「builtin 官方接口直连」或「官方 RSS」,不依赖第三方聚合服务;
 * 抖音/微博/B站等平台没有稳定公开接口,自建 DailyHotApi 后取消注释启用。
 */
export const SOURCES: SourceConfig[] = [
  // ── 热榜(官方接口 / GitHub 归档直连,无需第三方实例)──────────────
  { id: "douyin", name: "抖音热榜", group: "热榜", kind: "builtin", route: "douyin-hot-hub", home: "https://www.douyin.com/hot" },
  { id: "toutiao", name: "今日头条热榜", group: "热榜", kind: "builtin", route: "toutiao-board", home: "https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc" },
  { id: "weibo", name: "微博热搜", group: "热榜", kind: "builtin", route: "weibo-hot", home: "https://s.weibo.com/top/summary" },
  { id: "bilibili", name: "哔哩哔哩", group: "热榜", kind: "builtin", route: "bilibili-ranking", home: "https://www.bilibili.com/v/popular/rank/all" },

  // ── 开源趋势 ──────────────────────────────────────────────
  { id: "github", name: "GitHub Trending", group: "开源趋势", kind: "builtin", route: "github-trending", home: "https://github.com/trending" },

  // ── AI·科技 ───────────────────────────────────────────────
  { id: "hackernews", name: "Hacker News", group: "AI·科技", kind: "builtin", route: "hackernews", home: "https://news.ycombinator.com/" },
  { id: "sspai", name: "少数派", group: "AI·科技", kind: "rss", url: "https://sspai.com/feed", home: "https://sspai.com/" },
  // 36氪官方 feed(https://36kr.com/feed)XML 含非法实体,rss-parser 解析失败,暂不启用

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
