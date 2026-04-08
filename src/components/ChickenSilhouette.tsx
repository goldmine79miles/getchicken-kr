"use client";

import type { GameState, PartId } from "@/types/game";
import { PART_ORDER } from "@/types/game";

interface Props {
  gameState: GameState;
  chickenColor: string;
  onTap: () => void;
  onSelectPart: (partId: PartId) => void;
}

// 실제 치킨 부위 형태의 SVG path (치킨 일러스트 기준)
const PART_PATHS: Record<PartId, string> = {
  drumstick: "M 160 130 C 175 125 190 135 195 150 L 210 200 C 215 215 205 225 195 220 L 175 195 C 165 180 155 155 160 130 Z",
  wing: "M 45 85 C 55 65 80 55 100 60 L 115 70 C 105 85 90 100 70 105 C 55 108 42 100 45 85 Z",
  breast: "M 85 95 C 100 80 130 78 145 90 L 155 120 C 155 145 140 160 120 165 C 100 168 82 155 80 135 Z",
  thigh: "M 120 155 C 135 150 150 155 160 170 L 170 200 C 170 215 160 220 148 218 L 130 200 C 118 185 112 165 120 155 Z",
  back: "M 95 70 C 105 60 125 58 138 65 L 145 90 C 148 105 140 115 125 118 C 105 120 90 110 88 95 Z",
  tail: "M 55 100 C 48 90 50 75 60 70 L 78 68 C 85 72 88 85 83 98 C 78 108 62 112 55 100 Z",
};

const PART_LABELS: Record<PartId, { x: number; y: number }> = {
  drumstick: { x: 180, y: 175 },
  wing: { x: 75, y: 82 },
  breast: { x: 118, y: 128 },
  thigh: { x: 142, y: 188 },
  back: { x: 115, y: 90 },
  tail: { x: 65, y: 88 },
};

export default function ChickenSilhouette({ gameState, chickenColor, onTap, onSelectPart }: Props) {
  const parts = gameState.parts;

  function getProgress(partId: PartId): number {
    const p = parts[partId];
    if (p.packaged) return 100;
    if (p.completed) return 100;
    return Math.min(100, (p.current / p.required) * 100);
  }

  return (
    <div className="relative mx-auto" style={{ width: 280, height: 280 }}>
      <svg
        viewBox="20 40 220 200"
        className="w-full h-full cursor-pointer"
        onClick={onTap}
      >
        <defs>
          {/* 각 부위별 progress 마스크 */}
          {PART_ORDER.map((partId) => {
            const progress = getProgress(partId);
            return (
              <clipPath key={`clip-${partId}`} id={`progress-${partId}`}>
                <rect x="0" y={240 - (progress / 100) * 240} width="240" height={(progress / 100) * 240} />
              </clipPath>
            );
          })}
        </defs>

        {/* 전체 치킨 외곽선 */}
        <g opacity="0.08">
          {PART_ORDER.map((partId) => (
            <path key={`bg-${partId}`} d={PART_PATHS[partId]} fill="#000" />
          ))}
        </g>

        {/* 부위별 진행률 채우기 */}
        {PART_ORDER.map((partId) => {
          const progress = getProgress(partId);
          const isActive = gameState.activePart === partId;
          const isCompleted = parts[partId].completed;
          const isPackaged = parts[partId].packaged;

          return (
            <g key={partId}>
              {/* 부위 영역 (클릭 가능) */}
              <path
                d={PART_PATHS[partId]}
                fill={progress > 0 ? "transparent" : "#e8e8e8"}
                stroke={isActive ? chickenColor : "#ccc"}
                strokeWidth={isActive ? 2.5 : 1}
                strokeDasharray={isActive && !isCompleted ? "6 3" : "none"}
                className="cursor-pointer transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isCompleted) onSelectPart(partId);
                }}
              />

              {/* 채워진 부분 */}
              {progress > 0 && (
                <g clipPath={`url(#progress-${partId})`}>
                  <path
                    d={PART_PATHS[partId]}
                    fill={isPackaged ? chickenColor : isCompleted ? "#FFD700" : `${chickenColor}${isActive ? "cc" : "80"}`}
                    className="transition-all duration-500"
                  />
                </g>
              )}

              {/* 부위 라벨 */}
              <text
                x={PART_LABELS[partId].x}
                y={PART_LABELS[partId].y}
                textAnchor="middle"
                fontSize={isActive ? 11 : 9}
                fontWeight={isActive ? 800 : 600}
                fill={isActive ? chickenColor : "#888"}
                className="pointer-events-none select-none"
              >
                {parts[partId].name}
              </text>

              {/* 퍼센트 표시 (활성 부위) */}
              {isActive && !isCompleted && (
                <text
                  x={PART_LABELS[partId].x}
                  y={PART_LABELS[partId].y + 14}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={700}
                  fill={chickenColor}
                  className="pointer-events-none"
                >
                  {Math.floor(progress)}%
                </text>
              )}

              {/* 완료 체크 */}
              {isCompleted && (
                <text
                  x={PART_LABELS[partId].x}
                  y={PART_LABELS[partId].y + 14}
                  textAnchor="middle"
                  fontSize={12}
                  className="pointer-events-none"
                >
                  {isPackaged ? "📦" : "✓"}
                </text>
              )}
            </g>
          );
        })}

        {/* 김 효과 */}
        {getProgress("breast") > 30 && (
          <g opacity="0.3" stroke="#999" strokeWidth="1.5" fill="none" strokeLinecap="round">
            <path d="M100 60 Q98 48 101 36">
              <animate attributeName="d" values="M100 60 Q98 48 101 36;M100 60 Q102 48 99 36;M100 60 Q98 48 101 36" dur="2.5s" repeatCount="indefinite" />
            </path>
            <path d="M125 55 Q123 43 126 31">
              <animate attributeName="d" values="M125 55 Q123 43 126 31;M125 55 Q127 43 124 31;M125 55 Q123 43 126 31" dur="3s" repeatCount="indefinite" />
            </path>
          </g>
        )}
      </svg>
    </div>
  );
}
