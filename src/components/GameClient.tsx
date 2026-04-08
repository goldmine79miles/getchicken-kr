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

type Tab = "game" | "collection" | "convert";

export default function GameClient() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [tab, setTab] = useState<Tab>("game");
  const [offlineGain, setOfflineGain] = useState(0);
  const [showOffline, setShowOffline] = useState(false);
  const [tapEffect, setTapEffect] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [convertMsg, setConvertMsg] = useState<string | null>(null);
  const [showBrandPicker, setShowBrandPicker] = useState(false);
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

  // ─── 랜딩: 브랜드 선택 ───
  if (!gameState) {
    return (
      <>
        {/* 히어로 */}
        <section className="bg-gradient-to-br from-[#FFF5EE] via-white to-[#FFF0E0] py-20 md:py-32">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="text-7xl md:text-8xl mb-6">🍗</div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
              치킨을<br />튀겨라
            </h1>
            <p className="text-lg md:text-xl text-[--color-text-secondary] max-w-lg mx-auto mb-10">
              좋아하는 브랜드 치킨을 부위별로 모으고,<br className="hidden md:block" />
              한마리 완성하면 진짜 치킨이 온다!
            </p>
            <a
              href="#brands"
              className="inline-block px-8 py-4 rounded-2xl text-lg font-extrabold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #FF6B35, #FF8F5E)" }}
            >
              브랜드 선택하고 시작하기 ↓
            </a>
          </div>
        </section>

        {/* 이용방법 */}
        <section id="how" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-12">이렇게 모아요</h2>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              {[
                { step: "1", emoji: "🏷️", title: "브랜드 선택", desc: "16개 브랜드 중 하나를 골라요" },
                { step: "2", emoji: "👆", title: "터치로 적립", desc: "치킨을 터치하거나 자동으로 모여요" },
                { step: "3", emoji: "📦", title: "부위별 포장", desc: "6부위를 다 모으면 한마리 완성!" },
                { step: "4", emoji: "🍗", title: "치킨 받기", desc: "완성하면 진짜 치킨이 온다!" },
              ].map((item) => (
                <div key={item.step} className="bg-[--color-bg] rounded-2xl p-6">
                  <div className="text-4xl mb-3">{item.emoji}</div>
                  <div className="text-xs font-bold text-[--color-chicken] mb-1">STEP {item.step}</div>
                  <div className="text-base font-extrabold mb-1">{item.title}</div>
                  <div className="text-sm text-[--color-text-muted]">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 브랜드 선택 */}
        <section id="brands" className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-3">어떤 치킨을 모을까요?</h2>
            <p className="text-center text-[--color-text-muted] mb-10">좋아하는 브랜드를 선택하면 그 치킨을 모아요</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
              {BRANDS.map((brand) => (
                <BrandCard
                  key={brand.id}
                  brand={brand}
                  selected={selectedBrand === brand.id}
                  onClick={() => setSelectedBrand(brand.id)}
                />
              ))}
            </div>
            <div className="text-center">
              <button
                onClick={() => selectedBrand && setGameState(startNewGame(selectedBrand))}
                disabled={!selectedBrand}
                className="px-12 py-4 rounded-2xl text-lg font-extrabold text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:shadow-none"
                style={{
                  background: selectedBrand
                    ? "linear-gradient(135deg, #FF6B35, #FF8F5E)"
                    : "#ddd",
                  cursor: selectedBrand ? "pointer" : "not-allowed",
                }}
              >
                {selectedBrand
                  ? `${BRANDS.find((b) => b.id === selectedBrand)?.emoji} ${BRANDS.find((b) => b.id === selectedBrand)?.meme} 모으기 시작!`
                  : "브랜드를 선택해주세요"}
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  // ─── 게임 플레이 중 ───
  const brand = getBrand(gameState.selectedBrand);
  if (!brand) return null;
  const progress = getTotalProgress(gameState);
  const isBoosted = Date.now() < gameState.speedBoostExpiry;
  const avgPrice = getAverageChickenPrice();

  return (
    <div id="game" className="max-w-6xl mx-auto px-6 py-10">
      {/* 오프라인 팝업 */}
      {showOffline && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setShowOffline(false)}>
          <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-[90%] shadow-2xl animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="text-6xl mb-4">🍗</div>
            <div className="text-xl font-extrabold mb-2">자는 동안 모았어요!</div>
            <div className="text-base text-[--color-text-secondary] mb-6 font-semibold">+{offlineGain.toFixed(1)} 적립</div>
            <button
              onClick={() => setShowOffline(false)}
              className="w-full py-3.5 rounded-xl text-white font-bold text-base shadow-md hover:shadow-lg transition-all"
              style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}cc)` }}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 전환 메시지 토스트 */}
      {convertMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg border animate-fade-in-up"
          style={{ borderColor: `${brand.color}40`, color: brand.color }}>
          {convertMsg}
        </div>
      )}

      {/* 상단 브랜드 + 시세 + 탭 네비 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowBrandPicker(!showBrandPicker)}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-white font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
            style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}cc)` }}
          >
            <span className="text-xl">{brand.emoji}</span>
            <span>{brand.meme}</span>
            <span className="text-xs opacity-70">▼</span>
          </button>
          <div>
            <div className="text-xs text-[--color-text-muted]">오늘의 치킨 시세</div>
            <div className="text-2xl font-extrabold">{avgPrice.toLocaleString()}원</div>
          </div>
        </div>

        {/* 탭 내비게이션 */}
        <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-[--color-border]">
          {([
            { key: "game" as Tab, label: "🍗 게임", },
            { key: "collection" as Tab, label: "🏆 컬렉션" },
            { key: "convert" as Tab, label: "💰 전환" },
          ]).map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                backgroundColor: tab === item.key ? brand.color : "transparent",
                color: tab === item.key ? "#fff" : "#8b95a1",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 브랜드 변경 드롭다운 */}
      {showBrandPicker && (
        <div className="mb-8 bg-white rounded-2xl p-6 shadow-lg border border-[--color-border] animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold">브랜드 변경</h3>
            <button onClick={() => setShowBrandPicker(false)} className="text-[--color-text-muted] hover:text-[--color-text-primary] text-xl">✕</button>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {BRANDS.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setGameState(changeBrand(gameState, b.id));
                  setShowBrandPicker(false);
                }}
                className="p-3 rounded-xl text-center transition-all hover:shadow-md"
                style={{
                  border: gameState.selectedBrand === b.id ? `2px solid ${b.color}` : "2px solid transparent",
                  backgroundColor: gameState.selectedBrand === b.id ? `${b.color}08` : "#fafafa",
                }}
              >
                <div className="text-2xl mb-1">{b.emoji}</div>
                <div className="text-xs font-bold">{b.meme}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── 게임 탭 ─── */}
      {tab === "game" && (
        <div className="grid md:grid-cols-2 gap-8">
          {/* 왼쪽: 치킨 실루엣 */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-[--color-border] text-center">
            <div
              className="transition-transform inline-block"
              style={{ transform: tapEffect ? "scale(0.96)" : "scale(1)" }}
            >
              <ChickenSilhouette gameState={gameState} chickenColor={brand.chickenColor} onTap={handleTap} />
            </div>

            <button
              onClick={handleTap}
              className="mt-6 px-8 py-3.5 rounded-2xl text-white font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
              style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}bb)` }}
            >
              👆 클릭해서 {brand.meme} 모으기
            </button>

            {/* 속도 표시 */}
            <div className="mt-4">
              <span
                className="inline-block px-4 py-1.5 rounded-full text-[13px] font-bold"
                style={{
                  backgroundColor: isBoosted ? `${brand.color}15` : "#f5f5f5",
                  color: isBoosted ? brand.color : "#8b95a1",
                }}
              >
                {isBoosted ? "⚡" : "🐔"} 모으는 속도 {isBoosted ? `${GAME_CONSTANTS.BOOST_MULTIPLIER}00%` : "100%"}
              </span>
            </div>
          </div>

          {/* 오른쪽: 진행률 + 부위 + 부스트 */}
          <div className="flex flex-col gap-5">
            {/* 전체 진행률 카드 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[--color-border]">
              <div className="flex justify-between mb-3">
                <span className="text-sm font-bold text-[--color-text-secondary]">🍗 한마리 완성까지</span>
                <span className="text-sm font-extrabold" style={{ color: brand.color }}>{progress.toFixed(1)}%</span>
              </div>
              <div className="h-4 bg-[#f5f5f5] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${brand.color}, ${brand.color}cc)`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-[--color-text-muted]">
                <span>완성 치킨 {gameState.completedChickens.length}마리</span>
                <span>누적 {gameState.convertedPoints}P</span>
              </div>
            </div>

            {/* 부위별 프로그레스 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[--color-border]">
              <h3 className="text-base font-extrabold mb-4">부위별 진행</h3>
              <PartProgress gameState={gameState} chickenColor={brand.chickenColor} onPackage={handlePackage} />
            </div>

            {/* 부스트 */}
            <button
              onClick={handleBoost}
              disabled={isBoosted}
              className="w-full py-4 rounded-2xl font-bold text-[15px] transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0 shadow-sm hover:shadow-md"
              style={{
                color: isBoosted ? "#aaa" : brand.color,
                background: isBoosted ? "#f5f5f5" : `linear-gradient(135deg, ${brand.color}10, ${brand.color}18)`,
                border: isBoosted ? "1px solid #eee" : `1.5px solid ${brand.color}30`,
              }}
            >
              ⚡ {isBoosted ? "부스트 활성중..." : "빠르게 모으기 (광고)"}
            </button>
          </div>
        </div>
      )}

      {/* ─── 컬렉션 탭 ─── */}
      {tab === "collection" && (
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold mb-1">🏆 내 컬렉션</h2>
            <p className="text-sm text-[--color-text-muted]">완성한 치킨 {gameState.completedChickens.length}마리</p>
          </div>
          {gameState.completedChickens.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-[--color-border]">
              <div className="text-7xl mb-5">🥚</div>
              <div className="text-xl font-bold mb-2">아직 완성한 치킨이 없어요</div>
              <div className="text-sm text-[--color-text-muted] mb-8">열심히 모아서 첫 치킨을 완성해보세요!</div>
              <button
                onClick={() => setTab("game")}
                className="px-8 py-3.5 rounded-2xl text-white font-bold shadow-md hover:shadow-lg transition-all"
                style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}cc)` }}
              >
                치킨 모으러 가기
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {gameState.completedChickens.map((c, i) => {
                const b = getBrand(c.brandId);
                return (
                  <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border border-[--color-border] hover:shadow-md transition-shadow">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm shrink-0"
                      style={{ background: `linear-gradient(135deg, ${b?.color}20, ${b?.color}40)` }}
                    >
                      {c.converted ? "✅" : (b?.emoji || "🍗")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-bold truncate">{b?.meme} {b?.menu}</div>
                      <div className="text-xs text-[--color-text-muted] mt-1">
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

      {/* ─── 전환 탭 ─── */}
      {tab === "convert" && (
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold mb-1">💰 포인트 전환</h2>
              <p className="text-sm text-[--color-text-muted]">포장 완료된 부위나 완성 치킨을 포인트로 전환해요</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-[--color-text-muted]">누적 전환</div>
              <div className="text-xl font-extrabold" style={{ color: brand.color }}>{gameState.convertedPoints}P</div>
            </div>
          </div>

          {getConvertableParts(gameState).length > 0 && (
            <div className="mb-8">
              <h3 className="text-base font-bold mb-4">📦 포장 완료 부위</h3>
              <div className="flex flex-col gap-3">
                {getConvertableParts(gameState).map((partId) => (
                  <div key={partId} className="flex items-center justify-between p-5 bg-white rounded-2xl shadow-sm border border-[--color-border]">
                    <div>
                      <div className="text-base font-bold">{gameState.parts[partId].name}</div>
                      <div className="text-xs text-[--color-text-muted]">{GAME_CONSTANTS.POINTS_PER_PART}P 전환 가능</div>
                    </div>
                    <button
                      onClick={() => handleConvertPart(partId)}
                      className="px-6 py-2.5 rounded-xl text-white text-sm font-bold shadow-sm hover:shadow-md transition-all"
                      style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}cc)` }}
                    >
                      전환
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {getUnconvertedChickenCount(gameState) > 0 && (
            <div className="mb-8">
              <h3 className="text-base font-bold mb-4">🍗 완성 치킨</h3>
              <div className="flex flex-col gap-3">
                {gameState.completedChickens.map((c, i) => {
                  if (c.converted) return null;
                  const b = getBrand(c.brandId);
                  const total = 6 * GAME_CONSTANTS.POINTS_PER_PART + GAME_CONSTANTS.POINTS_FULL_BONUS;
                  return (
                    <div key={i} className="flex items-center justify-between p-5 bg-white rounded-2xl shadow-sm border border-[--color-border]">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{b?.emoji}</span>
                        <div>
                          <div className="text-base font-bold">{b?.meme} {b?.menu}</div>
                          <div className="text-xs text-[--color-text-muted]">{total}P (보너스 포함)</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleConvertChicken(i)}
                        className="px-6 py-2.5 rounded-xl text-white text-sm font-bold shadow-sm hover:shadow-md transition-all"
                        style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}cc)` }}
                      >
                        전환
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {getConvertableParts(gameState).length === 0 && getUnconvertedChickenCount(gameState) === 0 && (
            <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-[--color-border]">
              <div className="text-7xl mb-5">💸</div>
              <div className="text-xl font-bold mb-2">전환할 수 있는 치킨이 없어요</div>
              <div className="text-sm text-[--color-text-muted] mb-8">부위를 다 모으고 포장하면 전환할 수 있어요</div>
              <button
                onClick={() => setTab("game")}
                className="px-8 py-3.5 rounded-2xl text-white font-bold shadow-md hover:shadow-lg transition-all"
                style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}cc)` }}
              >
                치킨 모으러 가기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
