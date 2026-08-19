import "./globals.css";

export const metadata = {
  title: "ClipInOne · 真实素材，一键成片",
  description: "为本地小商户生成10秒竖屏宣传短视频",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
