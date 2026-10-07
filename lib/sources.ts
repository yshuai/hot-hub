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
  { id: "bilibili", name: "哔哩哔哩", group: "热榜", kind: "builtin", route: "bilibili-ranking", home: "https://www.bilibili.com/v/popular/rank/all" },
  { id: "zhihu", name: "知乎热榜", group: "热榜", kind: "builtin", route: "zhihu-hot-hub", home: "https://www.zhihu.com/hot" },
  // 微博:官方接口对匿名海外 IP 返回 403,无稳定免鉴权通道;
  // 自建国内出口的 DailyHotApi 后,把 kind 改为 "dailyhot"、route 改为 "weibo" 并 enabled: true
  { id: "weibo", name: "微博热搜", group: "热榜", kind: "builtin", route: "weibo-hot", home: "https://s.weibo.com/top/summary", enabled: false },

  // ── 开源趋势 ──────────────────────────────────────────────
  { id: "github", name: "GitHub Trending", group: "开源趋势", kind: "builtin", route: "github-trending", home: "https://github.com/trending" },

  // ── AI·科技 ───────────────────────────────────────────────
  { id: "hackernews", name: "Hacker News", group: "AI·科技", kind: "builtin", route: "hackernews", home: "https://news.ycombinator.com/" },
  { id: "sspai", name: "少数派", group: "AI·科技", kind: "rss", url: "https://sspai.com/feed", home: "https://sspai.com/" },
  // 36氪官方 feed(https://36kr.com/feed)XML 含非法实体,rss-parser 解析失败,暂不启用

  // ── 账号订阅:复制一行、改 name 和 token 即可订阅自己的账号 ────────────
  // 头条账号:token 从作者主页 URL 取,如 https://www.toutiao.com/c/user/token/<token>/
  // (内置 a_bogus 签名直连官方接口,无需自建 RSSHub)
  {
    id: "linshu-fabu",
    name: "临沭发布",
    group: "账号订阅",
    kind: "builtin",
    route: "toutiao-user",
    enabled: true,
    token: "CifrwCu3Stgkv4DazvWToMrdRAkapyTYlVGoZB-bjLoKFBXnpc4kPR4aSQo8AAAAAAAAAAAAAFD9Lrvz2RtLo3R-cyJVS-U1TYyszeQgKfMBNJXzLuzXaD2iMnvWILVRdj3yuDuiaXt5EMijng4Yw8WD6gQiAQPZICsc",
    home: "https://www.toutiao.com/c/user/token/CifrwCu3Stgkv4DazvWToMrdRAkapyTYlVGoZB-bjLoKFBXnpc4kPR4aSQo8AAAAAAAAAAAAAFD9Lrvz2RtLo3R-cyJVS-U1TYyszeQgKfMBNJXzLuzXaD2iMnvWILVRdj3yuDuiaXt5EMijng4Yw8WD6gQiAQPZICsc/",
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
