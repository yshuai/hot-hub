import Parser from "rss-parser";
import { DAILYHOT_API_BASE } from "./sources";
import type { FeedItem, SourceConfig } from "./types";

const UA = "Mozilla/5.0 (compatible; HotHub/0.1; +https://github.com/yshuai/hot-hub)";
const parser = new Parser({ headers: { "user-agent": UA } });
const TIMEOUT = 10_000;
const MAX_ITEMS = 30;

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "user-agent": UA },
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function fetchJson(url: string): Promise<any> {
  const text = await fetchText(url);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("响应不是 JSON");
  }
}

// ── dailyhot:第三方 DailyHotApi 实例(imsyy/DailyHotApi)────────────────
// GET /{route} → { data: [{ title, url?, mobileUrl?, hot? }] }

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

// ── rss:通用 feed(RSSHub、wewe-rss、官方 RSS 等)─────────────────────

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

// ── builtin:官方接口直连,不依赖第三方聚合服务 ─────────────────────────

/** Hacker News:官方 Firebase API */
async function fetchHackerNews(): Promise<FeedItem[]> {
  const ids: number[] = await fetchJson(
    "https://hacker-news.firebaseio.com/v0/topstories.json",
  );
  const stories = await Promise.all(
    ids.slice(0, MAX_ITEMS).map(async (id) => {
      try {
        return await fetchJson(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      } catch {
        return null;
      }
    }),
  );
  return stories
    .filter(Boolean)
    .map((s: any) => ({
      title: String(s.title ?? "").trim(),
      url: String(s.url || `https://news.ycombinator.com/item?id=${s.id}`),
      extra: s.score != null ? `${s.score} 分` : undefined,
    }))
    .filter((it) => it.title && it.url);
}

/** GitHub Trending:解析官方 trending 页面(stargazers 链接模式,多年稳定) */
async function fetchGithubTrending(): Promise<FeedItem[]> {
  const html = await fetchText("https://github.com/trending");
  const re = /href="\/([\w.-]+\/[\w.-]+)\/stargazers"/g;
  const seen = new Set<string>();
  const items: FeedItem[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) && items.length < MAX_ITEMS) {
    const full = m[1];
    if (seen.has(full)) continue;
    seen.add(full);
    items.push({ title: full, url: `https://github.com/${full}` });
  }
  if (!items.length) throw new Error("Trending 页面解析失败");
  return items;
}

/** 今日头条热榜:官方热榜接口 */
async function fetchToutiaoBoard(): Promise<FeedItem[]> {
  const json = await fetchJson(
    "https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc",
  );
  const list: any[] = Array.isArray(json?.data) ? json.data : [];
  return list
    .map((it) => ({
      title: String(it.Title ?? it.title ?? "").trim(),
      url: String(it.Url ?? it.url ?? ""),
      extra: it.HotValue != null ? String(it.HotValue) : undefined,
    }))
    .filter((it) => it.title && it.url)
    .slice(0, MAX_ITEMS);
}

async function fetchBuiltin(src: SourceConfig): Promise<FeedItem[]> {
  switch (src.route) {
    case "hackernews":
      return fetchHackerNews();
    case "github-trending":
      return fetchGithubTrending();
    case "toutiao-board":
      return fetchToutiaoBoard();
    default:
      throw new Error(`未知内置源:${src.route}`);
  }
}

// ── 分发 ──────────────────────────────────────────────────────────────

export async function fetchSource(src: SourceConfig): Promise<FeedItem[]> {
  if (src.kind === "builtin") return fetchBuiltin(src);
  if (src.kind === "dailyhot") return fetchDailyHot(src);
  return fetchRss(src);
}
