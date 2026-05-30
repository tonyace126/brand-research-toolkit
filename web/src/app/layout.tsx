import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "羅德島總控",
  description: "你的專案進度、時程與當前任務 — 一眼掌握",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" data-theme="vanguard" className="h-full antialiased">
      <body className="relative flex min-h-full flex-col">{children}</body>
    </html>
  );
}
