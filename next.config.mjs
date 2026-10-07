/** @type {import('next').NextConfig} */
const nextConfig = {
  // 闲鱼行情归档 md 由本地脚本 git push 进仓库,页面构建时读取;
  // 必须显式声明,否则 Next 的 file tracing 不会把它打进部署产物
  outputFileTracingIncludes: {
    "/": ["./daily/xianyu/**/*"],
  },
};

export default nextConfig;
