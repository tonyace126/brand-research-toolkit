import type { Metadata } from "next";
import "./globals.css";
import "./blueprint-theme.css";

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
      <body className="min-h-full">{children}</body>
    </html>
  );
}
