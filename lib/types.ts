export type SourceKind = "dailyhot" | "rss";

export interface SourceConfig {
  id: string;
  name: string;
  /** 分组:热榜 / 开源趋势 / AI·科技 / 账号订阅 */
  group: string;
  kind: SourceKind;
  /** DailyHotApi 路由名(kind=dailyhot 时必填),如 douyin / toutiao / github */
  route?: string;
  /** RSS 地址(kind=rss 时必填):RSSHub 路由、wewe-rss 公众号、AIHOT、GitHubTrendingRSS 等 */
  url?: string;
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
