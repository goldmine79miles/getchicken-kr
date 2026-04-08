import GameClient from "@/components/GameClient";

export default function Home() {
  return (
    <>
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
