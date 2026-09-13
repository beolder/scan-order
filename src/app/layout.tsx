import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "扫码点餐",
  description: "堂食桌台扫码点餐 MVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
