#!/usr/bin/env node
// 每日日报归档:GitHub Actions 定时运行(北京时间每天 08:00),写入 daily/YYYY-MM-DD.md
// 榜单源与 lib/sources.ts 保持一致;要归档 RSS 源(公众号/头条账号),往 RSS_SOURCES 里加。
import fs from "node:fs/promises";
import path from "node:path";
import Parser from "rss-parser";

const DAILYHOT_API_BASE =
  process.env.DAILYHOT_API_BASE ?? "https://api-hot.imsyy.top";
const UA = "Mozilla/5.0 (compatible; HotHub/0.1)";

const HOT_ROUTES = [
  ["douyin", "抖音热榜"],
  ["toutiao", "今日头条"],
  ["weibo", "微博热搜"],
  ["github", "GitHub Trending"],
  ["hackernews", "Hacker News"],
];
// 需要归档的 RSS 源:[显示名, feed 地址];账号订阅源建议在此留档
const RSS_SOURCES = [];
const TOP_N = 20;

const parser = new Parser({ headers: { "user-agent": UA } });

async function fetchDailyHot(route) {
  const res = await fetch(`${DAILYHOT_API_BASE}/${route}`, {
    headers: { "user-agent": UA },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return (json.data ?? [])
    .slice(0, TOP_N)
    .map((it, i) => `${i + 1}. [${it.title}](${it.url || it.mobileUrl})`);
}

async function fetchRss(url) {
  const feed = await parser.parseURL(url);
  return feed.items.slice(0, TOP_N).map((it, i) => `${i + 1}. [${it.title}](${it.link})`);
}

const today = new Date().toISOString().slice(0, 10);
const sections = [];

for (const [route, name] of HOT_ROUTES) {
  try {
    const lines = await fetchDailyHot(route);
    sections.push(`## ${name}\n\n${lines.join("\n")}`);
  } catch (err) {
    sections.push(`## ${name}\n\n> 抓取失败:${err.message}`);
  }
}
for (const [name, url] of RSS_SOURCES) {
  try {
    const lines = await fetchRss(url);
    sections.push(`## ${name}\n\n${lines.join("\n")}`);
  } catch (err) {
    sections.push(`## ${name}\n\n> 抓取失败:${err.message}`);
  }
}

const md = `# Hot Hub 日报 · ${today}\n\n${sections.join("\n\n")}\n`;
await fs.mkdir("daily", { recursive: true });
await fs.writeFile(path.join("daily", `${today}.md`), md, "utf8");
console.log(`written: daily/${today}.md`);
