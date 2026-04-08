"use client";

import type { GameState } from "@/types/game";
import { PART_ORDER } from "@/types/game";

interface Props {
  gameState: GameState;
  chickenColor: string;
  capacityPercent: number; // 튀김통 채움 비율 (0~100)
  onTap: () => void;
}

/** 튀김통 채움률에 따른 치킨 색상 (0%: 연크림 → 100%: 진한 골든브라운) */
function getFryColor(capacityPercent: number): string {
  const stops = [
    { at: 0, r: 255, g: 248, b: 220 },   // #FFF8DC 코른실크 (생닭)
    { at: 20, r: 255, g: 235, b: 175 },   // 연한 노랑
    { at: 45, r: 255, g: 200, b: 80 },    // 골드
    { at: 70, r: 230, g: 160, b: 30 },    // 진한 골드
    { at: 90, r: 200, g: 130, b: 20 },    // 골든브라운
    { at: 100, r: 170, g: 100, b: 10 },   // 다크 크리스피
  ];

  const p = Math.max(0, Math.min(100, capacityPercent));
  let i = 0;
  while (i < stops.length - 1 && stops[i + 1].at <= p) i++;
  if (i >= stops.length - 1) {
    const s = stops[stops.length - 1];
    return `rgb(${s.r},${s.g},${s.b})`;
  }

  const a = stops[i];
  const b = stops[i + 1];
  const t = (p - a.at) / (b.at - a.at);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r},${g},${bl})`;
}

export default function ChickenSilhouette({ gameState, capacityPercent, onTap }: Props) {
  const fryColor = getFryColor(capacityPercent);
  const isCrispy = capacityPercent >= 95;

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
        {/* 전체 배경: capacity에 따라 색상 전체 변경 */}
        <div
          className="absolute inset-0 transition-colors duration-700"
          style={{ backgroundColor: fryColor }}
        />

        {/* 크리스피 텍스처 (70% 이상부터 서서히) */}
        {capacityPercent > 40 && (
          <div
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              opacity: Math.min(0.6, (capacityPercent - 40) / 100),
              background: `radial-gradient(circle at 30% 35%, rgba(120,60,0,0.4) 0%, transparent 40%),
                           radial-gradient(circle at 65% 55%, rgba(140,70,10,0.35) 0%, transparent 35%),
                           radial-gradient(circle at 50% 25%, rgba(160,80,0,0.3) 0%, transparent 45%),
                           radial-gradient(circle at 40% 70%, rgba(130,65,5,0.25) 0%, transparent 30%)`,
            }}
          />
        )}

        {/* 100% 크리스피 효과: 진한 반점 */}
        {isCrispy && (
          <div
            className="absolute inset-0"
            style={{
              opacity: 0.4,
              background: `radial-gradient(circle at 25% 30%, rgba(80,40,0,0.5) 0%, transparent 20%),
                           radial-gradient(circle at 60% 40%, rgba(90,45,0,0.4) 0%, transparent 18%),
                           radial-gradient(circle at 45% 65%, rgba(85,42,0,0.45) 0%, transparent 22%),
                           radial-gradient(circle at 75% 55%, rgba(70,35,0,0.35) 0%, transparent 15%),
                           radial-gradient(circle at 35% 50%, rgba(100,50,0,0.3) 0%, transparent 25%)`,
            }}
          />
        )}
      </div>

      {/* 치킨 외곽선 */}
      <img
        src="/chicken-clean.png"
        alt="치킨"
        draggable={false}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        style={{
          opacity: 0.08 + capacityPercent * 0.002,
          filter: capacityPercent > 50
            ? `sepia(${capacityPercent / 200}) saturate(${1 + capacityPercent / 100})`
            : "grayscale(0.5)",
        }}
      />

      {/* 김/연기 효과 (60% 이상) */}
      {capacityPercent > 60 && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 220 220"
        >
          <g opacity={Math.min(0.6, (capacityPercent - 60) / 60)} stroke="#bbb" strokeWidth="1.5" fill="none" strokeLinecap="round">
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
