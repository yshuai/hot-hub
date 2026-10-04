import { fetchAllSources } from "@/lib/fetchAll";

// ISR:每 10 分钟重新生成一次页面(期间命中 Vercel 边缘缓存)
export const revalidate = 600;

export default async function Home() {
  const results = await fetchAllSources();
  const groups = [...new Set(results.map((r) => r.group))];
  const latest = Math.max(...results.map((r) => r.fetchedAt));

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hot Hub <span className="text-neutral-400">热点聚合</span>
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            抖音 · 头条 · 微博 · GitHub Trending · AI 资讯 · 账号订阅,统一聚合
          </p>
        </div>
        <div className="text-right text-xs text-neutral-500">
          <p>更新于 {new Date(latest).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false })}</p>
          <p className="mt-1 flex justify-end gap-3">
            <a className="underline hover:text-neutral-800" href="/api/feed">
              RSS 订阅
            </a>
            <a
              className="underline hover:text-neutral-800"
              href="https://github.com/yshuai/hot-hub"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </p>
        </div>
      </header>

      {groups.map((group) => (
        <section key={group} className="mb-10">
          <h2 className="mb-3 border-l-4 border-neutral-900 pl-2 text-lg font-semibold">
            {group}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results
              .filter((r) => r.group === group)
              .map((src) => (
                <article
                  key={src.id}
                  className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
                >
                  <h3 className="mb-2 flex items-center justify-between">
                    <span className="font-medium">{src.name}</span>
                    {src.home && (
                      <a
                        href={src.home}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-neutral-400 hover:text-neutral-700"
                      >
                        来源 ↗
                      </a>
                    )}
                  </h3>
                  {src.error ? (
                    <p className="text-sm text-red-500">抓取失败:{src.error}</p>
                  ) : (
                    <ol className="space-y-1.5">
                      {src.items.map((it, i) => (
                        <li key={i} className="flex gap-2 text-sm leading-snug">
                          <span className="w-5 shrink-0 text-right text-xs text-neutral-400">
                            {i + 1}
                          </span>
                          <a
                            href={it.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-neutral-700 hover:text-black hover:underline"
                          >
                            {it.title}
                          </a>
                          {it.time && (
                            <span className="ml-auto shrink-0 text-xs text-neutral-400">
                              {it.time.slice(5, 10)}
                            </span>
                          )}
                        </li>
                      ))}
                    </ol>
                  )}
                </article>
              ))}
          </div>
        </section>
      ))}

      <footer className="border-t border-neutral-200 pt-4 text-xs text-neutral-400">
        Hot Hub · 数据来自公开热榜接口与 RSS,仅作个人聚合阅读。信源配置见
        <code className="mx-1 rounded bg-neutral-200 px-1">lib/sources.ts</code>;
        日报归档见 <code className="mx-1 rounded bg-neutral-200 px-1">daily/</code> 目录。
      </footer>
    </main>
  );
}
