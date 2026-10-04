import { NextResponse } from "next/server";
import { fetchAllSources } from "@/lib/fetchAll";

// 与页面一致:10 分钟缓存,避免被打爆
export const revalidate = 600;

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** 把全部信源聚合成一条 RSS,方便在任意 RSS 阅读器里订阅"本站" */
export async function GET(request: Request) {
  const results = await fetchAllSources();
  const site =
    process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

  const items = results
    .filter((r) => !r.error)
    .flatMap((src) => src.items.slice(0, 20).map((it) => ({ src: src.name, ...it })));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>Hot Hub 热点聚合</title>
<link>${esc(site)}</link>
<description>热榜 + 开源趋势 + AI 资讯 + 账号订阅,统一输出</description>
<language>zh-CN</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items
  .map(
    (it) => `<item>
<title>[${esc(it.src)}] ${esc(it.title)}</title>
<link>${esc(it.url)}</link>
<guid>${esc(it.url)}</guid>
</item>`,
  )
  .join("\n")}
</channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "s-maxage=600, stale-while-revalidate=1800",
    },
  });
}
