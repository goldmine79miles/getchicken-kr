export default function PrivacyPage() {
  return (
    <div className="max-w-[600px] mx-auto px-5 py-6 text-[14px] leading-[1.8] text-[#333]">
      <h1 className="text-[20px] font-extrabold mb-5">치킨준닭 개인정보처리방침</h1>

      <p className="mb-4">
        치킨준닭(이하 &ldquo;서비스&rdquo;)은 이용자의 개인정보를 중요시하며, 「개인정보 보호법」을 준수합니다.
        본 개인정보처리방침은 서비스가 수집하는 개인정보의 항목, 수집 목적, 보유 기간 등을 안내합니다.
      </p>

      <Section title="1. 수집하는 개인정보 항목">
        <p>서비스는 토스 로그인을 통해 다음 개인정보를 수집합니다.</p>
        <table className="w-full mt-2 mb-2 border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border border-[#e5e5e5] p-2 text-left">구분</th>
              <th className="border border-[#e5e5e5] p-2 text-left">항목</th>
              <th className="border border-[#e5e5e5] p-2 text-left">수집 방법</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-[#e5e5e5] p-2">필수</td>
              <td className="border border-[#e5e5e5] p-2">이름</td>
              <td className="border border-[#e5e5e5] p-2">토스 로그인</td>
            </tr>
            <tr>
              <td className="border border-[#e5e5e5] p-2">자동 수집</td>
              <td className="border border-[#e5e5e5] p-2">서비스 이용 기록, 접속 시간</td>
              <td className="border border-[#e5e5e5] p-2">서비스 이용 시 자동 생성</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section title="2. 개인정보의 수집 및 이용 목적">
        <ul className="list-disc pl-5">
          <li>서비스 제공 및 이용자 식별</li>
          <li>게임 진행 상태 저장 및 복원</li>
          <li>부정이용 방지 및 서비스 안정성 확보</li>
          <li>서비스 개선 및 통계 분석 (비식별 처리)</li>
        </ul>
      </Section>

      <Section title="3. 개인정보의 보유 및 이용 기간">
        <p>이용자의 개인정보는 서비스 이용 기간 동안 보유하며, 서비스 탈퇴(연결 끊기) 시 즉시 파기합니다.</p>
        <p className="mt-2">단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.</p>
        <ul className="list-disc pl-5 mt-1">
          <li>전자상거래 등에서의 소비자 보호에 관한 법률: 계약·청약 철회 기록 5년</li>
          <li>통신비밀보호법: 접속 로그 기록 3개월</li>
        </ul>
      </Section>

      <Section title="4. 개인정보의 파기">
        <p>보유 기간이 경과하거나 처리 목적이 달성된 경우 다음과 같이 파기합니다.</p>
        <ul className="list-disc pl-5 mt-1">
          <li>전자적 파일: 복원 불가능한 방법으로 영구 삭제</li>
          <li>종이 문서: 분쇄기로 분쇄 또는 소각</li>
        </ul>
      </Section>

      <Section title="5. 개인정보의 제3자 제공">
        <p>서비스는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우는 예외로 합니다.</p>
        <ul className="list-disc pl-5 mt-1">
          <li>이용자가 사전에 동의한 경우</li>
          <li>법령에 의거하거나 수사기관의 요청이 있는 경우</li>
        </ul>
      </Section>

      <Section title="6. 개인정보의 처리 위탁">
        <p>서비스는 현재 개인정보 처리를 외부 업체에 위탁하지 않습니다. 향후 위탁이 필요한 경우 본 방침을 통해 사전 고지합니다.</p>
      </Section>

      <Section title="7. 이용자의 권리">
        <p>이용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
        <ul className="list-disc pl-5 mt-1">
          <li>개인정보 열람 요구</li>
          <li>오류 등이 있을 경우 정정 요구</li>
          <li>삭제 요구</li>
          <li>처리 정지 요구</li>
        </ul>
        <p className="mt-2">권리 행사는 이메일(getchikn@gmail.com)을 통해 요청할 수 있으며, 지체 없이 조치하겠습니다.</p>
      </Section>

      <Section title="8. 개인정보 보호책임자">
        <ul className="list-none mt-1">
          <li>담당자: 치킨준닭 운영팀</li>
          <li>이메일: getchikn@gmail.com</li>
        </ul>
      </Section>

      <Section title="9. 개인정보처리방침의 변경">
        <p>이 개인정보처리방침은 법령·정책 또는 서비스 변경에 따라 수정될 수 있으며, 변경 시 서비스 내 공지를 통해 안내합니다.</p>
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
