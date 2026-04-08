"use client";

import type { GameState } from "@/types/game";
import { PART_ORDER } from "@/types/game";

interface Props {
  gameState: GameState;
  chickenColor: string;
  capacityPercent: number; // 바구니 채움 비율 (0~100)
  onTap: () => void;
}

/** 바구니 채움률에 따라 노릇해지는 색상 (매 사이클마다 반복) */
function getFryColor(capacityPercent: number): string {
  // 0%: 희미한 연노랑 → 50%: 골드 → 100%: 골든브라운
  const stops = [
    { at: 0, r: 255, g: 248, b: 220 },   // #FFF8DC 코른실크 (기름에 넣은 직후)
    { at: 30, r: 255, g: 223, b: 135 },   // 연한 골드
    { at: 60, r: 255, g: 193, b: 37 },    // #FFC125 골드
    { at: 85, r: 218, g: 165, b: 32 },    // #DAA520 골든로드
    { at: 100, r: 184, g: 134, b: 11 },   // #B8860B 다크골든로드
  ];

  const p = Math.max(0, Math.min(100, capacityPercent));
  let i = 0;
  while (i < stops.length - 1 && stops[i + 1].at <= p) i++;
  if (i >= stops.length - 1) return `rgb(${stops[stops.length - 1].r},${stops[stops.length - 1].g},${stops[stops.length - 1].b})`;

  const a = stops[i];
  const b = stops[i + 1];
  const t = (p - a.at) / (b.at - a.at);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r},${g},${bl})`;
}

export default function ChickenSilhouette({ gameState, capacityPercent, onTap }: Props) {
  const totalRequired = PART_ORDER.reduce((sum, id) => sum + gameState.parts[id].required, 0);
  const totalCurrent = PART_ORDER.reduce((sum, id) => sum + gameState.parts[id].current, 0);
  const overallProgress = totalRequired > 0 ? (totalCurrent / totalRequired) * 100 : 0;

  // 바구니 기준 튀김 색상 (매 사이클 반복)
  const fryColor = getFryColor(capacityPercent);
  // 전체 진행률 기준 크리스피 강도 (0~1)
  const crispiness = overallProgress / 100;

  return (
    <div
      onClick={onTap}
      className="cursor-pointer select-none relative mx-auto active:scale-[0.96] transition-transform"
      style={{ width: 220, height: 220 }}
    >
      {/* 치킨 모양 마스크 */}
      <div
        className="absolute inset-0"
        style={{
          WebkitMaskImage: "url(/chicken-clean.png)",
          WebkitMaskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskImage: "url(/chicken-clean.png)",
          maskSize: "contain",
          maskRepeat: "no-repeat",
          maskPosition: "center",
        } as React.CSSProperties}
      >
        {/* 기본 배경: 희미한 연노랑 (기름에 넣은 느낌) */}
        <div className="absolute inset-0" style={{ backgroundColor: "#FFF8DC" }} />

        {/* 아래에서 위로 차오르는 튀김 색상 (바구니 기준) */}
        <div
          className="absolute inset-x-0 bottom-0 transition-all duration-500 ease-out"
          style={{
            height: `${Math.max(8, capacityPercent)}%`,
            background: `linear-gradient(to top, ${fryColor}, ${fryColor}cc)`,
          }}
        />

        {/* 크리스피 텍스처 오버레이 (전체 진행률 기준) */}
        {crispiness > 0.15 && (
          <div
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              opacity: Math.min(0.4, crispiness * 0.5),
              background: `radial-gradient(circle at 30% 40%, rgba(139,69,19,${crispiness * 0.3}) 0%, transparent 50%),
                           radial-gradient(circle at 70% 60%, rgba(160,82,45,${crispiness * 0.25}) 0%, transparent 40%),
                           radial-gradient(circle at 50% 30%, rgba(184,134,11,${crispiness * 0.2}) 0%, transparent 45%)`,
            }}
          />
        )}
      </div>

      {/* 치킨 외곽선 (진행률에 따라 진해짐) */}
      <img
        src="/chicken-clean.png"
        alt="치킨"
        draggable={false}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        style={{
          opacity: 0.1 + crispiness * 0.15,
          filter: crispiness > 0.5 ? `grayscale(${1 - crispiness}) sepia(${crispiness * 0.5})` : "grayscale(1)",
        }}
      />

      {/* 김/연기 효과 (바구니 30% 이상일 때) */}
      {capacityPercent > 30 && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 220 220"
        >
          <g opacity={Math.min(0.5, capacityPercent / 150)} stroke="#bbb" strokeWidth="1.5" fill="none" strokeLinecap="round">
            <path d="M80 70 Q78 55 81 40">
              <animate attributeName="d" values="M80 70 Q78 55 81 40;M80 70 Q82 55 79 40;M80 70 Q78 55 81 40" dur="2.5s" repeatCount="indefinite" />
            </path>
            <path d="M105 65 Q103 50 106 35">
              <animate attributeName="d" values="M105 65 Q103 50 106 35;M105 65 Q107 50 104 35;M105 65 Q103 50 106 35" dur="3s" repeatCount="indefinite" />
            </path>
            <path d="M130 70 Q128 55 131 40">
              <animate attributeName="d" values="M130 70 Q128 55 131 40;M130 70 Q132 55 129 40;M130 70 Q128 55 131 40" dur="2.8s" repeatCount="indefinite" />
            </path>
          </g>
        </svg>
      )}
    </div>
  );
}
