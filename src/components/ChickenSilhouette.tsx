"use client";

import type { GameState } from "@/types/game";
import { PART_ORDER } from "@/types/game";

interface Props {
  gameState: GameState;
  chickenColor: string;
  onTap: () => void;
}

/** 진행률에 따라 노릇해지는 색상 */
function getFryColor(progress: number): string {
  // 0%: 회색(생닭) → 30%: 밀색 → 60%: 골든 → 90%: 진갈 → 100%: 바삭
  const stops = [
    { at: 0, r: 224, g: 224, b: 224 },   // #e0e0e0 생닭
    { at: 25, r: 245, g: 222, b: 179 },   // #F5DEB3 살짝 익음
    { at: 50, r: 218, g: 165, b: 32 },    // #DAA520 노릇
    { at: 75, r: 184, g: 134, b: 11 },    // #B8860B 진갈
    { at: 100, r: 139, g: 69, b: 19 },    // #8B4513 바삭
  ];

  const p = Math.max(0, Math.min(100, progress));
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

export default function ChickenSilhouette({ gameState, onTap }: Props) {
  const totalRequired = PART_ORDER.reduce((sum, id) => sum + gameState.parts[id].required, 0);
  const totalCurrent = PART_ORDER.reduce((sum, id) => sum + gameState.parts[id].current, 0);
  const progress = totalRequired > 0 ? (totalCurrent / totalRequired) * 100 : 0;
  const fryColor = getFryColor(progress);

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
        {/* 회색 빈 치킨 (배경) */}
        <div className="absolute inset-0 bg-[#e0e0e0]" />

        {/* 아래에서 위로 차오르는 컬러 (노릇해지기) */}
        <div
          className="absolute inset-x-0 bottom-0 transition-all duration-700 ease-out"
          style={{
            height: `${progress}%`,
            background: `linear-gradient(to top, ${fryColor}, ${fryColor}dd)`,
          }}
        />
      </div>

      {/* 치킨 외곽선 */}
      <img
        src="/chicken-clean.png"
        alt="치킨"
        draggable={false}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        style={{ opacity: 0.15, filter: "grayscale(1)" }}
      />

      {/* 김 효과 */}
      {progress > 30 && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 220 220"
        >
          <g opacity={Math.min(0.5, progress / 150)} stroke="#aaa" strokeWidth="2" fill="none" strokeLinecap="round">
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
