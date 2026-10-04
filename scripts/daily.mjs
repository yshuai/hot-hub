#!/usr/bin/env node
// 每日日报归档:GitHub Actions 定时运行(北京时间每天 08:00),写入 daily/YYYY-MM-DD.md
// 抓取逻辑与 lib/adapters.ts 的内置源保持一致(官方接口直连,不依赖第三方聚合实例);
// 要归档更多源:热榜加进 HOT_SOURCES,RSS(公众号/头条账号等)加进 RSS_SOURCES。
import fs from "node:fs/promises";
import path from "node:path";
import Parser from "rss-parser";

const UA = "Mozilla/5.0 (compatible; HotHub/0.1)";
const TOP_N = 20;

const parser = new Parser({ headers: { "user-agent": UA } });

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { "user-agent": UA },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// 内置直连源:id → 抓取函数(与 lib/adapters.ts 同步维护)
const BUILTIN_FETCHERS = {
  async hackernews() {
    const ids = await fetchJson("https://hacker-news.firebaseio.com/v0/topstories.json");
    const stories = await Promise.all(
      ids.slice(0, TOP_N).map(async (id) => {
        try {
          return await fetchJson(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        } catch {
          return null;
        }
      }),
    );
    return stories
      .filter(Boolean)
      .map((s) => `${s.score} 分 [${s.title}](${s.url || `https://news.ycombinator.com/item?id=${s.id}`})`);
  },
  async "github-trending"() {
    const res = await fetch("https://github.com/trending", {
      headers: { "user-agent": UA },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const re = /href="\/([\w.-]+\/[\w.-]+)\/stargazers"/g;
    const seen = new Set();
    const lines = [];
    let m;
    while ((m = re.exec(html)) && lines.length < TOP_N) {
      if (seen.has(m[1])) continue;
      seen.add(m[1]);
      lines.push(`${lines.length + 1}. [${m[1]}](https://github.com/${m[1]})`);
    }
    if (!lines.length) throw new Error("Trending 页面解析失败");
    return lines;
  },
  async "toutiao-board"() {
    const json = await fetchJson(
      "https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc",
    );
    return (json.data ?? [])
      .slice(0, TOP_N)
      .map((it, i) => `${i + 1}. [${it.Title}](${it.Url})`);
  },
};

// 日报包含的源:[显示名, 类型, 取值]
// builtin 类型取 BUILTIN_FETCHERS 的 key;rss 类型第三个元素是 feed 地址
const HOT_SOURCES = [
  ["今日头条热榜", "builtin", "toutiao-board"],
  ["GitHub Trending", "builtin", "github-trending"],
  ["Hacker News", "builtin", "hackernews"],
];
const RSS_SOURCES = [
  ["少数派", "https://sspai.com/feed"],
  // ["头条账号", "https://你的-rsshub/toutiao/user/token/xxx"],
  // ["微信公众号", "https://你的-wewe-rss/feed/xxx"],
];

async function fetchRss(url) {
  const feed = await parser.parseURL(url);
  return feed.items.slice(0, TOP_N).map((it, i) => `${i + 1}. [${it.title}](${it.link})`);
}

const today = new Date().toISOString().slice(0, 10);
const sections = [];

for (const [name, kind, key] of HOT_SOURCES) {
  try {
    const lines = await BUILTIN_FETCHERS[key]();
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
