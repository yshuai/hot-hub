import fs from "node:fs";
import path from "node:path";

export interface XianyuReportSummary {
  keyword: string;
  sample: number | null;
  median: string | null;
  bestBand: string | null;
  bestScore: string | null;
  supply: string | null;
  fetchedAt: string | null;
}

export interface XianyuArchive {
  file: string;
  updatedAt: Date | null;
  reports: XianyuReportSummary[];
}

const ARCHIVE_DIR = path.join(process.cwd(), "daily", "xianyu");
const REPORT_SPLIT = /^# 闲鱼行情雷达[:：]\s*/m;

function first(re: RegExp, text: string): string | null {
  const m = text.match(re);
  return m ? m[1].trim() : null;
}

function parseReport(chunk: string): XianyuReportSummary {
  return {
    keyword: (chunk.match(/^[^\n]*/) ?? ["未知关键词"])[0].trim() || "未知关键词",
    sample: Number(first(/样本\s*\*\*(\d+)\*\*\s*条/, chunk)) || null,
    median: first(/\|\s*中位数\s*\|\s*([\d.]+)\s*\|/, chunk),
    bestBand: first(/\*\*最佳机会[:：]\s*([^*（]+)\*\*/, chunk),
    bestScore: first(/机会分\s*([\d.]+)/, chunk),
    supply: first(/\*\*主导供给\*\*[:：]\s*([^\n*]+)/, chunk),
    fetchedAt: first(/抓取于\s*([0-9T:-]+)/, chunk),
  };
}

/**
 * 读取仓库内 daily/xianyu/ 最新一份行情归档(由本地 push_xianyu_report.py 推送)。
 * 在页面构建时执行;文件通过 outputFileTracingIncludes 打进部署产物。
 */
export function getXianyuArchive(): XianyuArchive | null {
  if (!fs.existsSync(ARCHIVE_DIR)) return null;
  const files = fs
    .readdirSync(ARCHIVE_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();
  const latest = files.at(-1);
  if (!latest) return null;

  const md = fs.readFileSync(path.join(ARCHIVE_DIR, latest), "utf-8");
  const chunks = md.split(REPORT_SPLIT).slice(1);
  const reports = (chunks.length ? chunks : [md]).map(parseReport);
  const stat = fs.statSync(path.join(ARCHIVE_DIR, latest));
  return { file: latest, updatedAt: stat.mtime, reports };
}

/** 完整报告在 GitHub 上的地址(页面"查看完整报告"链接) */
export function xianyuReportUrl(file: string): string {
  return `https://github.com/yshuai/hot-hub/blob/main/daily/xianyu/${encodeURIComponent(file)}`;
}
