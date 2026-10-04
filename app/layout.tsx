import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hot Hub · 热点聚合",
  description:
    "抖音/头条/微博热榜、GitHub Trending、AI 资讯与账号订阅(头条账号/微信公众号)的统一聚合站",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-neutral-50 text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
