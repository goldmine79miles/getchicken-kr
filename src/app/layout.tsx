import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "치킨준닭 | 치킨 모아서 치킨 받자!",
  description: "좋아하는 치킨 브랜드를 골라 부위별로 모으고, 한마리 완성하면 진짜 치킨을 받자! 12개 브랜드 치킨 수집 게임.",
  keywords: ["치킨준닭", "치킨 게임", "치킨 모으기", "치킨 받기", "idle game", "치킨 브랜드"],
  openGraph: {
    title: "치킨준닭 | 치킨 모아서 치킨 받자!",
    description: "좋아하는 치킨 브랜드를 골라 부위별로 모으고, 한마리 완성하면 진짜 치킨을 받자!",
    type: "website",
    locale: "ko_KR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FF6B35",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="antialiased min-h-dvh">
        {children}
      </body>
    </html>
  );
}
