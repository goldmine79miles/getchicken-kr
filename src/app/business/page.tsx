import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "사업자 정보 | 치킨준닭",
};

export default function BusinessPage() {
  return (
    <div className="max-w-[600px] mx-auto px-5 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-extrabold">사업자 정보</h1>
        <Link href="/" className="text-[#8b95a1] text-sm hover:text-[#666] transition-colors">✕ 닫기</Link>
      </div>
      <div className="bg-[#f9f9f9] rounded-2xl p-6 text-xs leading-relaxed">
        <div className="grid grid-cols-[100px_1fr] gap-y-3">
          <span className="text-[#8b95a1]">상호명</span>
          <span className="font-medium">주식회사 신디케이트서울</span>
          <span className="text-[#8b95a1]">대표자명</span>
          <span className="font-medium">김태섭</span>
          <span className="text-[#8b95a1]">사업자등록번호</span>
          <span className="font-medium">213-86-42691</span>
          <span className="text-[#8b95a1]">주소</span>
          <span className="font-medium">서울시 영등포구 여의대방로65길 6 15층, 1580호</span>
          <span className="text-[#8b95a1]">전화번호</span>
          <span className="font-medium">0508-9596-5532</span>
          <span className="text-[#8b95a1]">이메일</span>
          <span className="font-medium">getchikn@gmail.com</span>
          <span className="text-[#8b95a1]">통신판매신고</span>
          <span className="font-medium">제2025-서울영등포-2713호</span>
          <span className="text-[#8b95a1]">서비스</span>
          <span className="font-medium">치킨 튀기기 리워드 게임</span>
        </div>
        <hr className="my-4 border-[#e5e7eb]" />
        <p className="text-[10px] text-[#8b95a1]">
          본 서비스에 등장하는 브랜드 이름은 밈 네이밍이며 실제 브랜드와 무관합니다.
          서비스 내 적립된 치킨(g)은 별도 안내 없이 현금 또는 실물 교환 대상이 아닙니다.
        </p>
      </div>
    </div>
  );
}
