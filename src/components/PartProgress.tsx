"use client";

import type { GameState, PartId } from "@/types/game";
import { PART_ORDER } from "@/types/game";

const PART_EMOJI: Record<PartId, string> = {
  drumstick: "🍗",
  wing: "🪽",
  breast: "🥩",
  thigh: "🦵",
  back: "🦴",
  tail: "🦴",
};

interface Props {
  gameState: GameState;
  chickenColor: string;
  onPackage: (partId: PartId) => void;
  onSelectPart: (partId: PartId) => void;
}

export default function PartProgress({ gameState, chickenColor, onPackage, onSelectPart }: Props) {
  return (
    <div className="flex flex-col gap-2.5">
      {PART_ORDER.map((partId) => {
        const part = gameState.parts[partId];
        const percent = Math.min((part.current / part.required) * 100, 100);
        const isActive = gameState.activePart === partId;

        return (
          <div
            key={partId}
            className="flex items-center gap-2.5 p-1.5 rounded-xl transition-all cursor-pointer"
            style={{
              backgroundColor: isActive ? `${chickenColor}08` : "transparent",
              border: isActive ? `1.5px solid ${chickenColor}30` : "1.5px solid transparent",
            }}
            onClick={() => !part.completed && onSelectPart(partId)}
          >
            <div className="w-16 flex items-center gap-1">
              <span className="text-sm">{part.packaged ? "🥡" : PART_EMOJI[partId]}</span>
              <span
                className="text-[13px] font-bold"
                style={{ color: isActive ? chickenColor : part.packaged ? chickenColor : part.completed ? "#FFD700" : "#4e5968" }}
              >
                {part.name}
              </span>
            </div>

            <div className="flex-1 h-3.5 bg-[#f5f5f5] rounded-full overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${percent}%`,
                  background: part.packaged
                    ? `linear-gradient(90deg, ${chickenColor}, ${chickenColor}cc)`
                    : part.completed
                    ? "linear-gradient(90deg, #FFD700, #FFC107)"
                    : isActive
                    ? `linear-gradient(90deg, ${chickenColor}90, ${chickenColor}cc)`
                    : `linear-gradient(90deg, ${chickenColor}40, ${chickenColor}60)`,
                }}
              />
              {percent > 8 && (
                <div className="absolute inset-0 flex items-center pl-2">
                  <span className="text-[9px] font-bold text-white drop-shadow-sm">
                    {part.current.toFixed(1)}g
                  </span>
                </div>
              )}
            </div>

            <div className="w-14 text-right">
              {part.completed && !part.packaged ? (
                <button
                  onClick={(e) => { e.stopPropagation(); onPackage(partId); }}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg text-white font-bold shadow-sm active:scale-95 transition-transform"
                  style={{ background: `linear-gradient(135deg, ${chickenColor}, ${chickenColor}dd)` }}
                >
                  포장!
                </button>
              ) : isActive && !part.completed ? (
                <span className="text-[11px] font-bold" style={{ color: chickenColor }}>모으는중</span>
              ) : (
                <span className="text-[11px] text-[--color-text-muted] font-medium">
                  {part.packaged ? "완료" : `${part.current.toFixed(1)}g`}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
