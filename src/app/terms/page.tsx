import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "이용약관 | 치킨준닭",
};

export default function TermsPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-extrabold">이용약관</h1>
        <Link href="/" className="text-[#8b95a1] text-sm hover:text-[#666] transition-colors">✕ 닫기</Link>
      </div>
      <div className="bg-[#f9f9f9] rounded-2xl p-6 text-[#4e5968] text-xs leading-relaxed space-y-4">
        <section>
          <h2 className="text-[#191f28] text-sm font-medium mb-2">제1조 (목적)</h2>
          <p>이 약관은 주식회사 신디케이트서울(이하 &quot;회사&quot;)이 운영하는 치킨준닭(이하 &quot;서비스&quot;)이 제공하는 치킨 튀기기 리워드 게임 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
        </section>
        <section>
          <h2 className="text-[#191f28] text-sm font-medium mb-2">제2조 (정의)</h2>
          <p>1. &quot;서비스&quot;란 치킨준닭이 제공하는 치킨 튀기기 아이들/탭 게임 및 리워드 서비스를 말합니다.</p>
          <p>2. &quot;이용자&quot;란 서비스에 접속하여 이 약관에 따라 서비스를 이용하는 자를 말합니다.</p>
          <p>3. &quot;치킨(g)&quot;이란 서비스 내에서 치킨을 튀겨 모으는 가상의 수치를 말합니다.</p>
        </section>
        <section>
          <h2 className="text-[#191f28] text-sm font-medium mb-2">제3조 (약관의 효력)</h2>
          <p>이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다.</p>
        </section>
        <section>
          <h2 className="text-[#191f28] text-sm font-medium mb-2">제4조 (서비스의 내용)</h2>
          <p>1. 치킨 브랜드 선택 및 치킨 튀기기 (아이들/탭 게임)</p>
          <p>2. 튀김통 시스템을 통한 치킨 포장 및 적립</p>
          <p>3. 광고 시청을 통한 속도 부스트 및 튀김통 비우기</p>
          <p>4. 토스포인트 전환 (별도 안내 시)</p>
          <p>5. 기타 회사가 정하는 서비스</p>
        </section>
        <section>
          <h2 className="text-[#191f28] text-sm font-medium mb-2">제5조 (이용자의 의무)</h2>
          <p>1. 이용자는 자동화 프로그램, 매크로 등 비정상적인 방법으로 서비스를 이용해서는 안 됩니다.</p>
          <p>2. 서비스의 안정적 운영을 방해하거나 타인의 개인정보를 도용해서는 안 됩니다.</p>
          <p>3. 위반 시 서비스 이용이 제한되거나 적립된 치킨(g) 및 포인트가 회수될 수 있습니다.</p>
        </section>
        <section>
          <h2 className="text-[#191f28] text-sm font-medium mb-2">제6조 (면책조항)</h2>
          <p>1. 서비스 내에서 모은 치킨(g)은 서비스 내부 지표이며, 별도 공지 없이는 현금 또는 실물 교환 대상이 아닙니다.</p>
          <p>2. 토스포인트 전환 등의 보상은 회사의 별도 안내에 따르며, 변경·중단될 수 있습니다.</p>
          <p>3. 본 서비스에 등장하는 브랜드 이름은 밈 네이밍이며 실제 브랜드와 무관합니다.</p>
        </section>
        <section>
          <h2 className="text-[#191f28] text-sm font-medium mb-2">제7조 (광고)</h2>
          <p>서비스 내에 배너 광고, 리워드 광고 등이 포함될 수 있으며, 광고를 통해 연결되는 외부 서비스에 대해 회사는 책임지지 않습니다.</p>
        </section>
        <section>
          <h2 className="text-[#191f28] text-sm font-medium mb-2">제8조 (약관의 변경)</h2>
          <p>회사는 필요한 경우 관련 법령을 위배하지 않는 범위 내에서 이 약관을 변경할 수 있으며, 변경된 약관은 서비스 내에 공지함으로써 효력을 발생합니다.</p>
        </section>
        <p className="text-[#8b95a1] text-[10px] pt-4">시행일: 2026년 4월 9일</p>
      </div>
    </div>
  );
}
