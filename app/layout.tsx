import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientLayout from "./client-layout";

export const metadata: Metadata = {
  title: "專屬旅行島",
  description: "我們的甜蜜旅遊規劃",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-HK" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/justfont/open-huninn-font@1.1/font.css" />
        <style dangerouslySetInnerHTML={{__html: `
          body {
            background-color: #F6F1E8 !important;
            /* 🌟 放大畫布為 300x300，放入 7 個不同大小、角度與透明度的三角形，創造不規則散落感 */
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cg fill='%239E8C78'%3E%3Cpolygon points='0,-10 8.6,5 -8.6,5' transform='translate(40, 50) rotate(15) scale(1.5)' opacity='0.15'/%3E%3Cpolygon points='0,-10 8.6,5 -8.6,5' transform='translate(150, 80) rotate(-40) scale(1.8)' opacity='0.1'/%3E%3Cpolygon points='0,-10 8.6,5 -8.6,5' transform='translate(260, 40) rotate(105) scale(1.3)' opacity='0.18'/%3E%3Cpolygon points='0,-10 8.6,5 -8.6,5' transform='translate(80, 180) rotate(-75) scale(1.1)' opacity='0.08'/%3E%3Cpolygon points='0,-10 8.6,5 -8.6,5' transform='translate(210, 220) rotate(25) scale(1.6)' opacity='0.12'/%3E%3Cpolygon points='0,-10 8.6,5 -8.6,5' transform='translate(280, 260) rotate(-15) scale(2.0)' opacity='0.15'/%3E%3Cpolygon points='0,-10 8.6,5 -8.6,5' transform='translate(40, 280) rotate(60) scale(2.2)' opacity='0.1'/%3E%3C/g%3E%3C/svg%3E") !important;
          }
          .acnh-bg { background-color: transparent !important; }
        `}} />
      </head>
      {/* 🌟 已經移除會報錯的外部 CDN 連結，全面依賴你本地的 globals.css */}
      <body className="antialiased overflow-x-hidden" suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}