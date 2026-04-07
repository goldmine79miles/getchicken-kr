"use client";

import type { GameState, PartId } from "@/types/game";
import { PART_ORDER } from "@/types/game";

interface Props {
  gameState: GameState;
  chickenColor: string;
  onTap: () => void;
}

const PART_CLIPS: Record<PartId, string> = {
  tail: "polygon(0% 0%, 16% 0%, 16% 100%, 0% 100%)",
  wing: "polygon(14% 0%, 46% 0%, 46% 56%, 14% 56%)",
  breast: "polygon(14% 54%, 46% 54%, 46% 100%, 14% 100%)",
  drumstick: "polygon(44% 0%, 73% 0%, 73% 56%, 44% 56%)",
  thigh: "polygon(44% 54%, 73% 54%, 73% 100%, 44% 100%)",
  back: "polygon(71% 0%, 100% 0%, 100% 100%, 71% 100%)",
};

export default function ChickenSilhouette({ gameState, chickenColor, onTap }: Props) {
  const parts = gameState.parts;

  function getProgress(partId: PartId): number {
    const p = parts[partId];
    if (p.packaged) return 100;
    if (p.completed) return 100;
    return Math.min(100, (p.current / p.required) * 100);
  }

  const totalProgress = PART_ORDER.reduce(
    (sum, id) => sum + getProgress(id), 0
  ) / PART_ORDER.length;

  return (
    <div
      onClick={onTap}
      className="cursor-pointer select-none relative mx-auto active:scale-[0.96] transition-transform"
      style={{ width: 240, height: 240 }}
    >
      {/* 치킨 마스크 영역 (치킨 모양으로만 보임) */}
      <div
        className="absolute inset-0"
        style={{
          WebkitMaskImage: "url(/chicken.png)",
          WebkitMaskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskImage: "url(/chicken.png)",
          maskSize: "contain",
          maskRepeat: "no-repeat",
          maskPosition: "center",
        } as React.CSSProperties}
      >
        {/* 회색 치킨 (배경) */}
        <img
          src="/chicken.png"
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full object-contain"
          style={{ filter: "grayscale(1) brightness(1.5) opacity(0.15)" }}
        />

        {/* 부위별 컬러 오버레이 */}
        {PART_ORDER.map((partId) => {
          const progress = getProgress(partId);
          if (progress <= 0) return null;
          const isPackaged = parts[partId].packaged;

          return (
            <div
              key={partId}
              className="absolute inset-0"
              style={{ clipPath: PART_CLIPS[partId] }}
            >
              <div
                className="absolute inset-0 transition-all duration-700 ease-out"
                style={{ clipPath: `inset(${100 - progress}% 0 0 0)` }}
              >
                <img
                  src="/chicken.png"
                  alt=""
                  draggable={false}
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{
                    filter: isPackaged ? "saturate(1.2) brightness(1.05)" : "none",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 김 효과 (마스크 바깥 - 잘리지 않음) */}
      {totalProgress > 20 && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 240 240"
        >
          <g opacity={Math.min(0.4, totalProgress / 200)} stroke="#999" strokeWidth="2" fill="none" strokeLinecap="round">
            <path d="M90 70 Q88 55 91 40">
              <animate attributeName="d" values="M90 70 Q88 55 91 40;M90 70 Q92 55 89 40;M90 70 Q88 55 91 40" dur="2.5s" repeatCount="indefinite" />
            </path>
            <path d="M110 65 Q108 50 111 35">
              <animate attributeName="d" values="M110 65 Q108 50 111 35;M110 65 Q112 50 109 35;M110 65 Q108 50 111 35" dur="3s" repeatCount="indefinite" />
            </path>
            <path d="M130 70 Q128 55 131 40">
              <animate attributeName="d" values="M130 70 Q128 55 131 40;M130 70 Q132 55 129 40;M130 70 Q128 55 131 40" dur="2.8s" repeatCount="indefinite" />
            </path>
          </g>
        </svg>
      )}

      {/* 부위 상태 도트 (마스크 바깥) */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {PART_ORDER.map((partId) => {
          const part = parts[partId];
          return (
            <div
              key={partId}
              className="w-2 h-2 rounded-full transition-colors"
              style={{
                backgroundColor: part.packaged ? chickenColor : part.completed ? "#FFD700" : "#ddd",
                boxShadow: part.packaged ? `0 0 4px ${chickenColor}60` : "none",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
