export type SourceKind = "dailyhot" | "rss" | "builtin";

export interface SourceConfig {
  id: string;
  name: string;
  /** 分组:热榜 / 开源趋势 / AI·科技 / 账号订阅 */
  group: string;
  kind: SourceKind;
  /**
   * kind=dailyhot → DailyHotApi 路由名(douyin / weibo / bilibili 等)
   * kind=builtin  → 内置直连实现名(hackernews / github-trending / toutiao-board)
   */
  route?: string;
  /** RSS 地址(kind=rss 时必填):RSSHub 路由、wewe-rss 公众号、AIHOT、GitHubTrendingRSS 等 */
  url?: string;
  /** 附加参数:kind=builtin route=toutiao-user 时为头条账号 token(作者主页 URL 中取) */
  token?: string;
  /** 信源主页(可选,卡片右上角"来源"链接) */
  home?: string;
  /** 设为 false 暂停抓取;加自己的账号源后改为 true */
  enabled?: boolean;
}

export interface FeedItem {
  title: string;
  url: string;
  /** 热度值 / 日期等附加信息 */
  extra?: string;
  time?: string;
}

export interface SourceResult {
  id: string;
  name: string;
  group: string;
  home?: string;
  items: FeedItem[];
  fetchedAt: number;
  error?: string;
}
