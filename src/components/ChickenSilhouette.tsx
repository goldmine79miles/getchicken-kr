"use client";

import type { GameState } from "@/types/game";
import { PART_ORDER } from "@/types/game";

interface Props {
  gameState: GameState;
  chickenColor: string;
  onTap: () => void;
}

export default function ChickenSilhouette({ gameState, chickenColor, onTap }: Props) {
  // 전체 진행률 (0~100)
  const totalRequired = PART_ORDER.reduce((sum, id) => sum + gameState.parts[id].required, 0);
  const totalCurrent = PART_ORDER.reduce((sum, id) => sum + gameState.parts[id].current, 0);
  const progress = totalRequired > 0 ? (totalCurrent / totalRequired) * 100 : 0;

  return (
    <div
      onClick={onTap}
      className="cursor-pointer select-none relative mx-auto active:scale-[0.96] transition-transform"
      style={{ width: 260, height: 260 }}
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

        {/* 아래에서 위로 차오르는 컬러 (진행률) */}
        <div
          className="absolute inset-x-0 bottom-0 transition-all duration-700 ease-out"
          style={{
            height: `${progress}%`,
            background: `linear-gradient(to top, ${chickenColor}, ${chickenColor}dd)`,
          }}
        />
      </div>

      {/* 치킨 외곽선 (마스크 밖에서 보이는 원본 이미지) */}
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
          viewBox="0 0 260 260"
        >
          <g opacity={Math.min(0.5, progress / 150)} stroke="#aaa" strokeWidth="2" fill="none" strokeLinecap="round">
            <path d="M100 80 Q98 65 101 50">
              <animate attributeName="d" values="M100 80 Q98 65 101 50;M100 80 Q102 65 99 50;M100 80 Q98 65 101 50" dur="2.5s" repeatCount="indefinite" />
            </path>
            <path d="M125 75 Q123 60 126 45">
              <animate attributeName="d" values="M125 75 Q123 60 126 45;M125 75 Q127 60 124 45;M125 75 Q123 60 126 45" dur="3s" repeatCount="indefinite" />
            </path>
            <path d="M150 80 Q148 65 151 50">
              <animate attributeName="d" values="M150 80 Q148 65 151 50;M150 80 Q152 65 149 50;M150 80 Q148 65 151 50" dur="2.8s" repeatCount="indefinite" />
            </path>
          </g>
        </svg>
      )}

      {/* 퍼센트 표시 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className="text-2xl font-extrabold drop-shadow-md"
          style={{ color: progress > 50 ? "#fff" : chickenColor }}
        >
          {Math.floor(progress)}%
        </span>
      </div>
    </div>
  );
}
