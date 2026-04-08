export default function MarketingPage() {
  return (
    <div className="max-w-[600px] mx-auto px-5 py-6 text-[14px] leading-[1.8] text-[#333]">
      <h1 className="text-[20px] font-extrabold mb-5">마케팅 정보 수신 동의</h1>

      <Section title="1. 수신 동의 항목">
        <p>치킨준닭 서비스의 이벤트, 혜택, 프로모션 등 광고성 정보를 받아보실 수 있습니다.</p>
      </Section>

      <Section title="2. 개인정보 수집·이용">
        <table className="w-full mt-2 mb-2 border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border border-[#e5e5e5] p-2 text-left">항목</th>
              <th className="border border-[#e5e5e5] p-2 text-left">내용</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-[#e5e5e5] p-2">수집 항목</td>
              <td className="border border-[#e5e5e5] p-2">이름</td>
            </tr>
            <tr>
              <td className="border border-[#e5e5e5] p-2">이용 목적</td>
              <td className="border border-[#e5e5e5] p-2">이벤트, 혜택, 프로모션 등 광고성 정보 전달</td>
            </tr>
            <tr>
              <td className="border border-[#e5e5e5] p-2">보유 기간</td>
              <td className="border border-[#e5e5e5] p-2">동의 철회 시 또는 서비스 탈퇴 시까지</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section title="3. 전송 방법">
        <ul className="list-disc pl-5">
          <li>앱 내 푸시 알림</li>
          <li>서비스 내 팝업 및 배너</li>
        </ul>
      </Section>

      <Section title="4. 수신 동의 철회">
        <p>마케팅 정보 수신에 동의하지 않으셔도 서비스 이용에 제한이 없습니다.</p>
        <p>수신 동의 후에도 언제든지 서비스 내 설정 또는 이메일(getchikn@gmail.com)을 통해 수신을 거부하실 수 있습니다.</p>
      </Section>

      <Section title="5. 기타">
        <p>본 동의는 선택사항이며, 동의하지 않아도 서비스의 기본 기능을 이용하실 수 있습니다.</p>
      </Section>

      <div className="mt-8 p-4 bg-[#f5f5f5] rounded-xl text-[13px] text-[#666]">
        <p>시행일: 2026년 4월 9일</p>
        <p>서비스명: 치킨준닭</p>
        <p>문의: getchikn@gmail.com</p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <h2 className="text-[16px] font-bold mt-6 mb-2">{title}</h2>
      {children}
    </>
  );
}
