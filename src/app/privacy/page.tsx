import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 치킨준닭",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-extrabold">개인정보처리방침</h1>
        <Link href="/" className="text-[#8b95a1] text-sm hover:text-[#666] transition-colors">✕ 닫기</Link>
      </div>
      <div className="bg-[#f9f9f9] rounded-2xl p-6 text-[#4e5968] text-xs leading-relaxed space-y-4">
        <section>
          <h2 className="text-[#191f28] text-sm font-medium mb-2">1. 개인정보의 수집 및 이용 목적</h2>
          <p>주식회사 신디케이트서울(이하 &quot;회사&quot;)이 운영하는 치킨준닭(이하 &quot;서비스&quot;)은 다음과 같은 목적으로 최소한의 개인정보를 수집합니다.</p>
          <p>- 서비스 제공 및 이용자 식별</p>
          <p>- 서비스 이용 통계 분석 및 개선</p>
          <p>- 문의 대응 및 고객 지원</p>
        </section>
        <section>
          <h2 className="text-[#191f28] text-sm font-medium mb-2">2. 수집하는 개인정보 항목</h2>
          <p>토스 로그인 이용 시: 이름 (필수 동의)</p>
          <p>서비스 이용 과정에서 다음 정보가 자동으로 생성/수집될 수 있습니다.</p>
          <p>- 접속 로그, 접속 IP, 브라우저 정보, 서비스 이용 기록</p>
          <p>- 쿠키(Cookie) 정보</p>
        </section>
        <section>
          <h2 className="text-[#191f28] text-sm font-medium mb-2">3. 개인정보의 보유 및 이용기간</h2>
          <p>회사는 서비스 이용 기간 동안 개인정보를 보유하며, 이용 목적이 달성된 후에는 즉시 파기합니다.</p>
        </section>
        <section>
          <h2 className="text-[#191f28] text-sm font-medium mb-2">4. 개인정보의 제3자 제공</h2>
          <p>회사는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.</p>
          <p>- 이용자의 사전 동의가 있는 경우</p>
          <p>- 법령에 의해 요구되는 경우</p>
        </section>
        <section>
          <h2 className="text-[#191f28] text-sm font-medium mb-2">5. 쿠키(Cookie)의 사용</h2>
          <p>서비스는 이용자의 편의를 위해 쿠키를 사용할 수 있습니다. 이용자는 브라우저 설정을 통해 쿠키의 저장을 거부할 수 있습니다.</p>
        </section>
        <section>
          <h2 className="text-[#191f28] text-sm font-medium mb-2">6. 개인정보 보호책임자</h2>
          <p>성명: 안동현</p>
          <p>소속: 주식회사 신디케이트서울</p>
          <p>전화: 0508-9596-5532</p>
          <p>이메일: getchikn@gmail.com</p>
        </section>
        <section>
          <h2 className="text-[#191f28] text-sm font-medium mb-2">7. 개인정보처리방침 변경</h2>
          <p>이 개인정보처리방침은 시행일로부터 적용되며, 변경사항이 있는 경우 서비스를 통해 공지합니다.</p>
        </section>
        <p className="text-[#8b95a1] text-[10px] pt-4">시행일: 2026년 4월 9일</p>
      </div>
    </div>
  );
}
