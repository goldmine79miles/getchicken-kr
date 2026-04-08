import GameClient from "@/components/GameClient";

export default function Home() {
  return (
    <>
      <main>
        <GameClient />
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t border-[--color-border] py-6 mt-4">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-[--color-text-muted]">
          <div className="mb-3 space-x-3 text-xs">
            <a href="/terms" className="underline hover:text-[#666]">이용약관</a>
            <span>|</span>
            <a href="/privacy" className="underline hover:text-[#666]">개인정보처리방침</a>
            <span>|</span>
            <a href="/marketing" className="underline hover:text-[#666]">마케팅 정보 수신</a>
          </div>
          <p className="mb-2">© 2026 치킨준닭. All rights reserved.</p>
          <p className="text-xs">본 서비스에 등장하는 브랜드 이름은 밈 네이밍이며 실제 브랜드와 무관합니다.</p>
          <p className="text-xs mt-1">문의: getchikn@gmail.com</p>
        </div>
      </footer>
    </>
  );
}
