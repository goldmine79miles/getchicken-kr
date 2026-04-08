import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "치킨준닭 | 치킨 튀겨서 치킨 받자",
  description: "좋아하는 브랜드 치킨을 직접 튀겨 모으면 진짜 치킨이 온다! 18개 브랜드 치킨 튀기기.",
  keywords: ["치킨준닭", "치킨 튀기기", "치킨 모으기", "치킨 받자", "치킨 브랜드"],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "치킨준닭 | 치킨을 튀겨라!",
    description: "좋아하는 치킨 브랜드를 골라 부위별로 모으고, 한마리 완성하면 진짜 치킨이 온다!",
    type: "website",
    locale: "ko_KR",
  },
  appleWebApp: {
    capable: true,
    title: "치킨준닭",
    statusBarStyle: "default",
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
