import Parser from "rss-parser";
import { DAILYHOT_API_BASE } from "./sources";
import type { FeedItem, SourceConfig } from "./types";

const UA = "Mozilla/5.0 (compatible; HotHub/0.1; +https://github.com/yshuai/hot-hub)";
const parser = new Parser({ headers: { "user-agent": UA } });

const MAX_ITEMS = 30;

async function fetchJson(url: string, timeoutMs = 10_000) {
  const res = await fetch(url, {
    headers: { "user-agent": UA },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** DailyHotApi:GET /{route} → { data: [{ title, url?, mobileUrl?, hot? }] } */
async function fetchDailyHot(src: SourceConfig): Promise<FeedItem[]> {
  const json = await fetchJson(`${DAILYHOT_API_BASE}/${src.route}`);
  const list: any[] = Array.isArray(json?.data) ? json.data : [];
  return list
    .map((it) => ({
      title: String(it.title ?? "").trim(),
      url: String(it.url || it.mobileUrl || ""),
      extra: it.hot != null ? String(it.hot) : undefined,
    }))
    .filter((it) => it.title && it.url)
    .slice(0, MAX_ITEMS);
}

/** 通用 RSS:RSSHub 路由、wewe-rss 公众号、AIHOT、GitHubTrendingRSS 等 */
async function fetchRss(src: SourceConfig): Promise<FeedItem[]> {
  const feed = await parser.parseURL(src.url!);
  return (feed.items ?? [])
    .map((it) => ({
      title: (it.title ?? "").trim(),
      url: it.link ?? "",
      time: it.isoDate
        ? new Date(it.isoDate).toISOString().slice(0, 16).replace("T", " ")
        : undefined,
    }))
    .filter((it) => it.title && it.url)
    .slice(0, MAX_ITEMS);
}

export async function fetchSource(src: SourceConfig): Promise<FeedItem[]> {
  if (src.kind === "dailyhot") return fetchDailyHot(src);
  return fetchRss(src);
}
