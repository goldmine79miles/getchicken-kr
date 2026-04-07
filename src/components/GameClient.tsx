"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { GameState, PartId } from "@/types/game";
import { GAME_CONSTANTS } from "@/types/game";
import { BRANDS, getBrand, getAverageChickenPrice } from "@/lib/brands";
import {
  loadGameState,
  restoreFromIDB,
  startNewGame,
  applyOfflineGain,
  applyTap,
  applyTick,
  packagePart,
  applySpeedBoost,
  convertPart,
  convertChicken,
  changeBrand,
  getTotalProgress,
  getConvertableParts,
  getUnconvertedChickenCount,
} from "@/lib/gameSystem";
import ChickenSilhouette from "./ChickenSilhouette";
import PartProgress from "./PartProgress";
import BrandCard from "./BrandCard";

type Page = "home" | "brand" | "collection" | "convert";

export default function GameClient() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [page, setPage] = useState<Page>("home");
  const [offlineGain, setOfflineGain] = useState(0);
  const [showOffline, setShowOffline] = useState(false);
  const [tapEffect, setTapEffect] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [convertMsg, setConvertMsg] = useState<string | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function load() {
      let state = loadGameState();
      if (!state) state = await restoreFromIDB();
      if (state) {
        const { state: updated, gained } = applyOfflineGain(state);
        setGameState(updated);
        if (gained > 1) {
          setOfflineGain(gained);
          setShowOffline(true);
        }
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!gameState) return;
    tickRef.current = setInterval(() => {
      setGameState((prev) => (prev ? applyTick(prev) : prev));
    }, 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [gameState?.selectedBrand]);

  const handleTap = useCallback(() => {
    setGameState((prev) => (prev ? applyTap(prev) : prev));
    setTapEffect(true);
    setTimeout(() => setTapEffect(false), 150);
  }, []);

  const handlePackage = useCallback((partId: PartId) => {
    setGameState((prev) => {
      if (!prev) return prev;
      return packagePart(prev, partId) ?? prev;
    });
  }, []);

  const handleBoost = useCallback(() => {
    setGameState((prev) => (prev ? applySpeedBoost(prev) : prev));
  }, []);

  const handleConvertPart = useCallback((partId: PartId) => {
    setGameState((prev) => {
      if (!prev) return prev;
      const result = convertPart(prev, partId);
      if (result) {
        setConvertMsg(`${prev.parts[partId].name} → ${result.points}P 전환 완료!`);
        setTimeout(() => setConvertMsg(null), 3000);
        return result.state;
      }
      return prev;
    });
  }, []);

  const handleConvertChicken = useCallback((index: number) => {
    setGameState((prev) => {
      if (!prev) return prev;
      const result = convertChicken(prev, index);
      if (result) {
        setConvertMsg(`한마리 완성 → ${result.points}P 전환!`);
        setTimeout(() => setConvertMsg(null), 3000);
        return result.state;
      }
      return prev;
    });
  }, []);

  // ─── 브랜드 선택 (초기) ───
  if (!gameState) {
    return (
      <div className="min-h-dvh bg-gradient-to-b from-[#FFF8F0] to-white">
        <div className="p-6 pt-10">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🍗</div>
            <h1 className="text-2xl font-extrabold tracking-tight">어떤 치킨을 모을까요?</h1>
            <p className="text-sm text-[--color-text-muted] mt-1.5">좋아하는 브랜드를 선택하면 그 치킨을 모아요</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {BRANDS.map((brand) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                selected={selectedBrand === brand.id}
                onClick={() => setSelectedBrand(brand.id)}
              />
            ))}
          </div>
          <div className="sticky bottom-6">
            <button
              onClick={() => selectedBrand && setGameState(startNewGame(selectedBrand))}
              disabled={!selectedBrand}
              className="w-full py-4 rounded-2xl text-lg font-extrabold text-white transition-all shadow-lg active:scale-[0.98]"
              style={{
                background: selectedBrand
                  ? "linear-gradient(135deg, #FF6B35, #FF8F5E)"
                  : "#ddd",
                boxShadow: selectedBrand
                  ? "0 8px 24px rgba(255,107,53,0.3)"
                  : "none",
                cursor: selectedBrand ? "pointer" : "not-allowed",
              }}
            >
              {selectedBrand
                ? `${BRANDS.find((b) => b.id === selectedBrand)?.emoji} ${BRANDS.find((b) => b.id === selectedBrand)?.meme} 모으기 시작!`
                : "브랜드를 선택해주세요"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const brand = getBrand(gameState.selectedBrand);
  if (!brand) return null;
  const progress = getTotalProgress(gameState);
  const isBoosted = Date.now() < gameState.speedBoostExpiry;
  const avgPrice = getAverageChickenPrice();

  return (
    <div className="min-h-dvh bg-white pb-24 relative">
      {/* 오프라인 팝업 */}
      {showOffline && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setShowOffline(false)}>
          <div className="bg-white rounded-3xl p-8 text-center max-w-[300px] w-[90%] shadow-2xl animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="text-6xl mb-4">🍗</div>
            <div className="text-xl font-extrabold mb-2">자는 동안 모았어요!</div>
            <div className="text-base text-[--color-text-secondary] mb-6 font-semibold">+{offlineGain.toFixed(1)} 적립</div>
            <button
              onClick={() => setShowOffline(false)}
              className="w-full py-3.5 rounded-xl text-white font-bold text-base shadow-md active:scale-[0.98] transition-transform"
              style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}cc)` }}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 전환 메시지 */}
      {convertMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg border animate-fade-in-up"
          style={{ borderColor: `${brand.color}40`, color: brand.color }}>
          {convertMsg}
        </div>
      )}

      {/* ─── 홈 ─── */}
      {page === "home" && (
        <>
          {/* 헤더 */}
          <div className="p-5 pb-4" style={{ background: `linear-gradient(180deg, ${brand.color}08, transparent)` }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs text-[--color-text-muted] font-medium">오늘의 치킨 시세 (평균)</div>
                <div className="text-3xl font-extrabold tracking-tight">{avgPrice.toLocaleString()}원</div>
              </div>
              <div
                className="px-3 py-1.5 rounded-xl text-white text-[13px] font-bold flex items-center gap-1.5 shadow-sm"
                style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}cc)` }}
              >
                <span>{brand.emoji}</span>
                <span>{brand.meme}</span>
              </div>
            </div>
          </div>

          {/* 속도 표시 */}
          <div className="flex justify-center py-2">
            <span
              className="px-4 py-1.5 rounded-full text-[13px] font-bold"
              style={{
                backgroundColor: isBoosted ? `${brand.color}15` : "#f5f5f5",
                color: isBoosted ? brand.color : "#8b95a1",
              }}
            >
              {isBoosted ? "⚡" : "🐔"} 모으는 속도 {isBoosted ? `${GAME_CONSTANTS.BOOST_MULTIPLIER}00%` : "100%"}
            </span>
          </div>

          {/* 치킨 실루엣 */}
          <div
            className="px-5 py-2 text-center transition-transform"
            style={{ transform: tapEffect ? "scale(0.97)" : "scale(1)" }}
          >
            <ChickenSilhouette gameState={gameState} chickenColor={brand.chickenColor} onTap={handleTap} />
            <div
              className="mt-4 inline-block px-5 py-2.5 rounded-full text-white text-sm font-bold shadow-md"
              style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}bb)` }}
            >
              👆 터치해서 {brand.meme} 모으기
            </div>
          </div>

          {/* 전체 진행률 */}
          <div className="px-5 py-4">
            <div className="flex justify-between mb-2">
              <span className="text-[13px] font-bold text-[--color-text-secondary]">🍗 한마리 완성까지</span>
              <span className="text-[13px] font-extrabold" style={{ color: brand.color }}>{progress.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-[#f5f5f5] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${brand.color}, ${brand.color}cc)`,
                }}
              />
            </div>
          </div>

          {/* 부위별 프로그레스 */}
          <div className="px-5 pb-4">
            <PartProgress gameState={gameState} chickenColor={brand.chickenColor} onPackage={handlePackage} />
          </div>

          {/* 부스트 버튼 */}
          <div className="px-5 pb-5">
            <button
              onClick={handleBoost}
              disabled={isBoosted}
              className="w-full py-4 rounded-2xl font-bold text-[15px] transition-all active:scale-[0.98] shadow-sm"
              style={{
                color: isBoosted ? "#aaa" : brand.color,
                background: isBoosted ? "#f5f5f5" : `linear-gradient(135deg, ${brand.color}10, ${brand.color}18)`,
                border: isBoosted ? "none" : `1.5px solid ${brand.color}30`,
              }}
            >
              ⚡ {isBoosted ? "부스트 활성중..." : "빠르게 모으기 (광고)"}
            </button>
          </div>
        </>
      )}

      {/* ─── 브랜드 변경 ─── */}
      {page === "brand" && (
        <div className="p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{brand.emoji}</span>
            <h2 className="text-xl font-extrabold">브랜드 변경</h2>
          </div>
          <p className="text-sm text-[--color-text-muted] mb-5">다른 치킨을 모아볼까요?</p>
          <div className="grid grid-cols-2 gap-3">
            {BRANDS.map((b) => (
              <BrandCard
                key={b.id}
                brand={b}
                selected={gameState.selectedBrand === b.id}
                onClick={() => {
                  setGameState(changeBrand(gameState, b.id));
                  setPage("home");
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ─── 컬렉션 ─── */}
      {page === "collection" && (
        <div className="p-5">
          <h2 className="text-xl font-extrabold mb-1">🏆 내 컬렉션</h2>
          <p className="text-sm text-[--color-text-muted] mb-5">완성한 치킨 {gameState.completedChickens.length}마리</p>
          {gameState.completedChickens.length === 0 ? (
            <div className="text-center py-20 text-[--color-text-muted]">
              <div className="text-6xl mb-4">🥚</div>
              <div className="text-[16px] font-bold mb-1">아직 완성한 치킨이 없어요</div>
              <div className="text-[13px] mb-6">열심히 모아서 첫 치킨을 완성해보세요!</div>
              <button
                onClick={() => setPage("home")}
                className="px-8 py-3.5 rounded-2xl text-white font-bold text-sm shadow-md active:scale-[0.98] transition-transform"
                style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}cc)` }}
              >
                치킨 모으러 가기
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {gameState.completedChickens.map((c, i) => {
                const b = getBrand(c.brandId);
                return (
                  <div key={i} className="flex items-center gap-3.5 p-4 rounded-2xl border border-[#f0f0f0] shadow-sm">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${b?.color}20, ${b?.color}40)` }}
                    >
                      {c.converted ? "✅" : (b?.emoji || "🍗")}
                    </div>
                    <div className="flex-1">
                      <div className="text-[15px] font-bold">{b?.meme} {b?.menu}</div>
                      <div className="text-xs text-[--color-text-muted] mt-0.5">
                        {new Date(c.completedAt).toLocaleDateString("ko-KR")} 완성
                        {c.converted && <span className="font-bold" style={{ color: b?.color }}> · {c.pointsEarned}P</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── 전환 ─── */}
      {page === "convert" && (
        <div className="p-5">
          <h2 className="text-xl font-extrabold mb-1">💰 포인트 전환</h2>
          <div className="flex items-center gap-2 mb-5">
            <span className="text-sm text-[--color-text-muted]">누적 전환</span>
            <span className="text-sm font-extrabold" style={{ color: brand.color }}>{gameState.convertedPoints}P</span>
          </div>

          {getConvertableParts(gameState).length > 0 && (
            <div className="mb-6">
              <h3 className="text-base font-bold mb-3">📦 포장 완료 부위</h3>
              {getConvertableParts(gameState).map((partId) => (
                <div key={partId} className="flex items-center justify-between p-4 rounded-2xl border border-[#f0f0f0] mb-2 shadow-sm">
                  <div>
                    <div className="text-[15px] font-bold">{gameState.parts[partId].name}</div>
                    <div className="text-xs text-[--color-text-muted]">{GAME_CONSTANTS.POINTS_PER_PART}P 전환 가능</div>
                  </div>
                  <button
                    onClick={() => handleConvertPart(partId)}
                    className="px-5 py-2.5 rounded-xl text-white text-[13px] font-bold shadow-sm active:scale-95 transition-transform"
                    style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}cc)` }}
                  >
                    전환
                  </button>
                </div>
              ))}
            </div>
          )}

          {getUnconvertedChickenCount(gameState) > 0 && (
            <div className="mb-6">
              <h3 className="text-base font-bold mb-3">🍗 완성 치킨</h3>
              {gameState.completedChickens.map((c, i) => {
                if (c.converted) return null;
                const b = getBrand(c.brandId);
                const total = 6 * GAME_CONSTANTS.POINTS_PER_PART + GAME_CONSTANTS.POINTS_FULL_BONUS;
                return (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-[#f0f0f0] mb-2 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{b?.emoji}</span>
                      <div>
                        <div className="text-[15px] font-bold">{b?.meme} {b?.menu}</div>
                        <div className="text-xs text-[--color-text-muted]">{total}P (보너스 포함)</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleConvertChicken(i)}
                      className="px-5 py-2.5 rounded-xl text-white text-[13px] font-bold shadow-sm active:scale-95 transition-transform"
                      style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}cc)` }}
                    >
                      전환
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {getConvertableParts(gameState).length === 0 && getUnconvertedChickenCount(gameState) === 0 && (
            <div className="text-center py-20 text-[--color-text-muted]">
              <div className="text-6xl mb-4">💸</div>
              <div className="text-[16px] font-bold mb-1">전환할 수 있는 치킨이 없어요</div>
              <div className="text-[13px] mb-6">부위를 다 모으고 포장하면 전환할 수 있어요</div>
              <button
                onClick={() => setPage("home")}
                className="px-8 py-3.5 rounded-2xl text-white font-bold text-sm shadow-md active:scale-[0.98] transition-transform"
                style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}cc)` }}
              >
                치킨 모으러 가기
              </button>
            </div>
          )}
        </div>
      )}

      {/* 하단 네비 */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] flex bg-white/95 backdrop-blur-md border-t border-[#f0f0f0] py-2 pb-[max(8px,env(safe-area-inset-bottom))]">
        {([
          { key: "home", icon: "🍗", activeIcon: "🍗", label: "홈" },
          { key: "collection", icon: "🗂️", activeIcon: "🗂️", label: "컬렉션" },
          { key: "brand", icon: "🏷️", activeIcon: "🏷️", label: "브랜드" },
          { key: "convert", icon: "🪙", activeIcon: "🪙", label: "전환" },
        ] as const).map((item) => {
          const isActive = page === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 bg-transparent border-none cursor-pointer transition-transform active:scale-90"
            >
              <span className="text-xl">{isActive ? item.activeIcon : item.icon}</span>
              <span
                className="text-[11px] font-bold transition-colors"
                style={{ color: isActive ? brand.color : "#b0b8c1" }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
