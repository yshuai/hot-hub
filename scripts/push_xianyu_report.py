#!/usr/bin/env python3
"""采集闲鱼行情并推送归档到 hot-hub 仓库(push 后 Vercel 自动重新部署)。

用法(在 hot-hub 目录):
    python scripts/push_xianyu_report.py 关键词1 关键词2 ...
    python scripts/push_xianyu_report.py            # 无参数时用 DEFAULT_KEYWORDS

前置:xianyu-radar 已安装且已登录(python -m xianyu_radar login 扫码)。
Cookie 约 7 天有效,失效后重新扫码。
"""
import datetime
import subprocess
import sys
from pathlib import Path

# 默认关注词单(改成你自己的品类)
DEFAULT_KEYWORDS = ["机械键盘", "柳编收纳筐"]

HOT_HUB = Path(__file__).resolve().parent.parent
REPORTS_DIR = Path.home() / ".xianyu-radar" / "reports"
PAGES = 2  # 每个词抓取页数


def run(cmd: list[str], **kw) -> None:
    print("+", " ".join(cmd), flush=True)
    subprocess.run(cmd, check=True, **kw)


def latest_report() -> Path:
    files = list(REPORTS_DIR.glob("*.md"))
    if not files:
        raise SystemExit(f"错误:{REPORTS_DIR} 下没有报告,先检查 analyze 是否成功")
    return max(files, key=lambda p: p.stat().st_mtime)


def main() -> None:
    keywords = sys.argv[1:] or DEFAULT_KEYWORDS
    today = datetime.date.today().isoformat()
    sections: list[str] = []

    for kw in keywords:
        run([sys.executable, "-m", "xianyu_radar", "search", kw, "--pages", str(PAGES)])
        run([sys.executable, "-m", "xianyu_radar", "analyze", kw])
        sections.append(latest_report().read_text(encoding="utf-8").strip())

    outdir = HOT_HUB / "daily" / "xianyu"
    outdir.mkdir(parents=True, exist_ok=True)
    outfile = outdir / f"{today}.md"
    outfile.write_text("\n\n---\n\n".join(sections) + "\n", encoding="utf-8")
    print(f"[written] {outfile}")

    def git(*args: str) -> None:
        run(["git", "-C", str(HOT_HUB), *args])

    git("pull", "--rebase", "origin", "main")
    git("add", "daily/xianyu/")
    quiet = subprocess.run(
        ["git", "-C", str(HOT_HUB), "diff", "--cached", "--quiet"]
    ).returncode
    if quiet == 0:
        print("报告与上次一致,无需提交")
        return
    git("commit", "-m", f"chore(xianyu): {today} 行情归档")
    git("push")
    print("[pushed] Vercel 将自动重新部署,几分钟后页面生效")


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as e:
        raise SystemExit(f"命令失败(退出码 {e.returncode});若提示登录失效,运行 python -m xianyu_radar login 重新扫码")
