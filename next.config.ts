import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 這是為了確保 Vercel 知道這些路徑是存在的
  trailingSlash: true,
};

export default nextConfig;