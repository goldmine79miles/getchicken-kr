import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "마케팅 정보 수신 동의 | 치킨준닭",
};

export default function MarketingPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-extrabold">마케팅 정보 수신 동의</h1>
        <Link href="/" className="text-[#8b95a1] text-sm hover:text-[#666] transition-colors">✕ 닫기</Link>
      </div>
      <div className="bg-[#f9f9f9] rounded-2xl p-6 text-[#4e5968] text-xs leading-relaxed space-y-4">
        <section>
          <h2 className="text-[#191f28] text-sm font-medium mb-2">1. 수신 동의 항목</h2>
          <p>치킨준닭 서비스의 이벤트, 혜택, 프로모션 등 광고성 정보를 받아보실 수 있습니다.</p>
        </section>
        <section>
          <h2 className="text-[#191f28] text-sm font-medium mb-2">2. 개인정보 수집·이용</h2>
          <p>- 수집 항목: 이름</p>
          <p>- 이용 목적: 이벤트, 혜택, 프로모션 등 광고성 정보 전달</p>
          <p>- 보유 기간: 동의 철회 시 또는 서비스 탈퇴 시까지</p>
        </section>
        <section>
          <h2 className="text-[#191f28] text-sm font-medium mb-2">3. 전송 방법</h2>
          <p>- 앱 내 푸시 알림</p>
          <p>- 서비스 내 팝업 및 배너</p>
        </section>
        <section>
          <h2 className="text-[#191f28] text-sm font-medium mb-2">4. 수신 동의 철회</h2>
          <p>마케팅 정보 수신에 동의하지 않으셔도 서비스 이용에 제한이 없습니다. 동의 후에도 언제든지 이메일(getchikn@gmail.com)을 통해 수신을 거부하실 수 있습니다.</p>
        </section>
        <p className="text-[#8b95a1] text-[10px] pt-4">시행일: 2026년 4월 9일</p>
      </div>
    </div>
  );
}
