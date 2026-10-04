import { fetchSource } from "./adapters";
import { SOURCES } from "./sources";
import type { SourceResult } from "./types";

/** 并发抓取全部启用信源;单源失败不影响其他源(返回 error 字段) */
export async function fetchAllSources(): Promise<SourceResult[]> {
  return Promise.all(
    SOURCES.filter((s) => s.enabled !== false).map(
      async (src): Promise<SourceResult> => {
        const fetchedAt = Date.now();
        try {
          const items = await fetchSource(src);
          return { id: src.id, name: src.name, group: src.group, home: src.home, items, fetchedAt };
        } catch (err) {
          return {
            id: src.id,
            name: src.name,
            group: src.group,
            home: src.home,
            items: [],
            fetchedAt,
            error: err instanceof Error ? err.message : "抓取失败",
          };
        }
      },
    ),
  );
}
