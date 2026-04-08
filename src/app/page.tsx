import GameClient from "@/components/GameClient";

export default function Home() {
  return (
    <>
      <main>
        <GameClient />
      </main>

      {/* 푸터 */}
      <footer className="py-6 mt-4 pb-24 text-center">
        <div className="flex justify-center gap-3 flex-wrap text-[10px] text-[#8b95a1]">
          <a href="/terms" className="hover:text-[#666] transition-colors">이용약관</a>
          <span>|</span>
          <a href="/privacy" className="hover:text-[#666] transition-colors">개인정보처리방침</a>
          <span>|</span>
          <a href="/marketing" className="hover:text-[#666] transition-colors">마케팅 정보 수신</a>
          <span>|</span>
          <a href="/business" className="hover:text-[#666] transition-colors">사업자 정보</a>
        </div>
        <p className="text-[#8b95a1]/50 text-[9px] mt-2">getchikn@gmail.com</p>
      </footer>
    </>
  );
}
