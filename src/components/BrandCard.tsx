"use client";

import type { Brand } from "@/types/game";

interface Props {
  brand: Brand;
  selected?: boolean;
  onClick: () => void;
}

export default function BrandCard({ brand, selected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="relative p-4 rounded-2xl text-center transition-all overflow-hidden"
      style={{
        border: selected ? `2.5px solid ${brand.color}` : "2px solid #f0f0f0",
        backgroundColor: selected ? `${brand.color}08` : "#fff",
        boxShadow: selected
          ? `0 4px 20px ${brand.color}20`
          : "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {selected && (
        <div
          className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px]"
          style={{ backgroundColor: brand.color }}
        >
          ✓
        </div>
      )}
      <div
        className="w-14 h-14 rounded-2xl mx-auto mb-2.5 flex items-center justify-center text-2xl shadow-sm"
        style={{
          background: `linear-gradient(135deg, ${brand.color}20, ${brand.color}40)`,
        }}
      >
        {brand.emoji}
      </div>
      <div className="text-[15px] font-extrabold text-[--color-text-primary] tracking-tight">{brand.meme}</div>
      <div className="text-[12px] font-bold mt-0.5 tracking-tight" style={{ color: brand.color }}>{brand.menu}</div>
      <div className="text-[11px] text-[--color-text-muted] mt-1.5 leading-tight">{brand.description}</div>
    </button>
  );
}
