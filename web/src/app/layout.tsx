import type { Metadata } from "next";
import "./globals.css";
import GridBackground from "@/components/grid-background";

export const metadata: Metadata = {
  title: "小蜜蜂 · 專案控制台",
  description: "你的專案進度、時程與當前任務 — 一眼掌握",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" className="h-full antialiased">
      <body className="relative flex min-h-full flex-col">
        {/* 方舟風幾何字型：Saira(拉丁) + Noto Sans TC(中文) + Chakra Petch(HUD 代碼) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=Noto+Sans+TC:wght@400;500;700;900&family=Saira:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <GridBackground />
        {children}
      </body>
    </html>
  );
}
