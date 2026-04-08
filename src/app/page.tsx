import GameClient from "@/components/GameClient";

export default function Home() {
  return (
    <>
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[--color-border]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🍗</span>
            <span className="text-xl font-extrabold tracking-tight">치킨준닭</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[--color-text-muted]">
            <a href="#game" className="hover:text-[--color-text-primary] transition-colors">게임</a>
            <a href="#brands" className="hover:text-[--color-text-primary] transition-colors">브랜드</a>
            <a href="#how" className="hover:text-[--color-text-primary] transition-colors">이용방법</a>
          </nav>
        </div>
      </header>

      <main>
        <GameClient />
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t border-[--color-border] py-10 mt-20">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-[--color-text-muted]">
          <p className="mb-2">© 2026 치킨준닭. All rights reserved.</p>
          <p className="text-xs">본 서비스에 등장하는 브랜드 이름은 밈 네이밍이며 실제 브랜드와 무관합니다.</p>
        </div>
      </footer>
    </>
  );
}
