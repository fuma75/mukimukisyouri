import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "筋虎 - 筋トレ＆食事管理と熱血アドバイス",
  description: "筋トレ記録、食事管理、そして熱血AIトレーナー「筋虎」によるアドバイスで、あなたのボディメイクをトータルサポートするWebアプリ。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700;900&family=Outfit:wght@300;400;500;600;700;900&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="dark-theme">
        <div className="app-container">
          {children}
        </div>
      </body>
    </html>
  );
}
