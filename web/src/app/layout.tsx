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
        {/* 圓體：Huninn(中文圓體) + Nunito(拉丁圓體) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Huninn&family=Nunito:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <GridBackground />
        {children}
      </body>
    </html>
  );
}
