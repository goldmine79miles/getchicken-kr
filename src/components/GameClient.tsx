"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { GameState } from "@/types/game";
import { GAME_CONSTANTS, PART_ORDER } from "@/types/game";
import { BRANDS, getBrand, getAverageChickenPrice, BRAND_PRICES } from "@/lib/brands";
import {
  loadGameState,
  restoreFromIDB,
  startNewGame,
  applyOfflineGain,
  applyTap,
  applyTick,
  packageCapacity,
  applySpeedBoost,
  changeBrand,
  getTotalProgress,
  getUnconvertedChickenCount,
  isCapacityFull,
  getCurrentSpeed,
} from "@/lib/gameSystem";
import ChickenSilhouette from "./ChickenSilhouette";
import BrandCard from "./BrandCard";

type Tab = "fry" | "mychicken";

export default function GameClient() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [tab, setTab] = useState<Tab>("fry");
  const [offlineGain, setOfflineGain] = useState(0);
  const [showOffline, setShowOffline] = useState(false);
  const [tapEffect, setTapEffect] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function load() {
      let state = loadGameState();
      if (!state) state = await restoreFromIDB();
      if (state) {
        const { state: updated, gained } = applyOfflineGain(state);
        setGameState(updated);
        if (gained > 0.1) {
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

  const handlePackage = useCallback(() => {
    setGameState((prev) => (prev ? packageCapacity(prev) : prev));
  }, []);

  const handleBoost = useCallback(() => {
    setGameState((prev) => (prev ? applySpeedBoost(prev) : prev));
  }, []);


  const handleGoHome = useCallback(() => {
    localStorage.removeItem("chickenGame");
    setGameState(null);
    setSelectedBrand(null);
  }, []);

  // ─── 헤더 ───
  const header = (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[--color-border]">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <button
          onClick={handleGoHome}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-2xl">🍗</span>
          <span className="text-xl font-extrabold tracking-tight">치킨준닭</span>
        </button>
        {!gameState && (
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[--color-text-muted]">
            <a href="#game" className="hover:text-[--color-text-primary] transition-colors">치킨모으기</a>
            <a href="#brands" className="hover:text-[--color-text-primary] transition-colors">브랜드</a>
            <a href="#how" className="hover:text-[--color-text-primary] transition-colors">이용방법</a>
          </nav>
        )}
      </div>
    </header>
  );

  // ─── 랜딩: 브랜드 선택 ───
  if (!gameState) {
    return (
      <>
        {header}
        {/* 히어로 */}
        <section className="bg-gradient-to-br from-[#FFF5EE] via-white to-[#FFF0E0] py-20 md:py-32">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="text-7xl md:text-8xl mb-6">🍗</div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
              치킨 튀겨서<br />치킨 받자
            </h1>
            <p className="text-lg md:text-xl text-[--color-text-secondary] max-w-md mx-auto mb-10 leading-relaxed">
              좋아하는 브랜드 치킨을 직접 튀겨 모으면,<br />
              진짜 치킨이 온다!
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
            <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-12">이렇게 튀겨요</h2>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              {[
                { step: "1", emoji: "🏷️", title: "브랜드 선택", desc: "18개 브랜드 중 하나를 골라요" },
                { step: "2", emoji: "👆", title: "치킨 튀기기", desc: "치킨을 눌러서 튀겨요" },
                { step: "3", emoji: "📦", title: "포장하기", desc: "바구니가 차면 포장해요" },
                { step: "4", emoji: "🍗", title: "치킨 완성", desc: "1,000g 모으면 한마리 완성!" },
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
            <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-3">먹고 싶은 닭을 튀겨보세요</h2>
            <p className="text-center text-[--color-text-muted] mb-10">좋아하는 브랜드를 선택하면 그 치킨을 튀겨요</p>
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
                  background: selectedBrand ? "linear-gradient(135deg, #FF6B35, #FF8F5E)" : "#ddd",
                  cursor: selectedBrand ? "pointer" : "not-allowed",
                }}
              >
                {selectedBrand
                  ? `🍗 ${BRANDS.find((b) => b.id === selectedBrand)?.meme} 튀기기 시작!`
                  : "브랜드를 선택해주세요"}
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  // ─── 플레이 중 ───
  const brand = getBrand(gameState.selectedBrand);
  if (!brand) return null;
  const progress = getTotalProgress(gameState);
  const totalCurrent = PART_ORDER.reduce((sum, id) => sum + gameState.parts[id].current, 0);
  const totalRequired = PART_ORDER.reduce((sum, id) => sum + gameState.parts[id].required, 0);
  const avgPrice = getAverageChickenPrice();
  const capacityFull = isCapacityFull(gameState);
  const capacityPercent = (gameState.currentCapacity / gameState.maxCapacity) * 100;

  return (
    <>
    {header}
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* 오프라인 팝업 */}
      {showOffline && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setShowOffline(false)}>
          <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-[90%] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-6xl mb-4">🍗</div>
            <div className="text-xl font-extrabold mb-2">쉬는 동안 튀겼어요!</div>
            <div className="text-base text-[--color-text-secondary] mb-6 font-semibold">+{offlineGain.toFixed(1)}g 적립</div>
            <button
              onClick={() => setShowOffline(false)}
              className="w-full py-3.5 rounded-xl text-white font-bold text-base shadow-md"
              style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}cc)` }}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* ─── 메인: 튀기기 탭 ─── */}
      {tab === "fry" && (
        <>
          {/* 오늘의 치킨 평균 시세 */}
          <div className="text-center mb-4">
            <div className="text-xs text-[--color-text-muted]">오늘의 치킨 평균 시세</div>
            <div className="text-3xl font-extrabold">{avgPrice.toLocaleString()}원</div>
          </div>

          {/* 먹고 싶은 닭을 튀겨보세요 + 브랜드 드롭다운 */}
          <div className="text-center mb-5">
            <button
              onClick={() => setShowBrandPicker(!showBrandPicker)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold border border-[--color-border] bg-white shadow-sm hover:shadow-md transition-all"
            >
              <span>먹고 싶은 닭을 튀겨보세요</span>
              <span className="text-lg">🍗</span>
              <span
                className="px-2.5 py-0.5 rounded-lg text-white text-xs font-extrabold"
                style={{ background: brand.color }}
              >
                {brand.meme}
              </span>
              <span className="text-xs text-[--color-text-muted]">▼</span>
            </button>
          </div>

          {/* 브랜드 드롭다운 */}
          {showBrandPicker && (
            <div className="mb-5 bg-white rounded-2xl p-5 shadow-lg border border-[--color-border]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-extrabold">브랜드 선택</h3>
                <button onClick={() => setShowBrandPicker(false)} className="text-[--color-text-muted] hover:text-[--color-text-primary] text-lg">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto">
                {BRANDS.map((b) => {
                  const price = BRAND_PRICES[b.id] || 0;
                  return (
                    <button
                      key={b.id}
                      onClick={() => {
                        setGameState(changeBrand(gameState, b.id));
                        setShowBrandPicker(false);
                      }}
                      className="p-3 rounded-xl text-left transition-all hover:shadow-md"
                      style={{
                        border: gameState.selectedBrand === b.id ? `2px solid ${b.color}` : "2px solid #f0f0f0",
                        backgroundColor: gameState.selectedBrand === b.id ? `${b.color}08` : "#fafafa",
                      }}
                    >
                      <div className="text-sm font-extrabold">{b.meme}</div>
                      <div className="text-xs font-bold mt-0.5" style={{ color: b.color }}>{b.menu}</div>
                      <div className="text-xs text-[--color-text-muted] mt-0.5">{price.toLocaleString()}원</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 메인 카드 */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[--color-border] mb-5">
            {/* 튀김 바구니 + 튀기는 속도 (g/hr) */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF3E0] text-[#E65100]">튀김 바구니</span>
                <span className="text-sm font-bold">{gameState.currentCapacity.toFixed(1)}g / {gameState.maxCapacity.toFixed(0)}g</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E3F2FD] text-[#1565C0]">속도</span>
                <span className="text-sm font-bold">{(getCurrentSpeed(gameState) * 3600).toFixed(1)}g/hr</span>
              </div>
            </div>

            {/* 바구니 바 */}
            <div className="h-2 bg-[#f0f0f0] rounded-full overflow-hidden mb-5">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${capacityPercent}%`,
                  background: capacityFull
                    ? "linear-gradient(90deg, #ff4444, #ff6666)"
                    : "linear-gradient(90deg, #FFB300, #FF8F00)",
                }}
              />
            </div>

            {/* 치킨 이미지 */}
            <div
              className="transition-transform mx-auto"
              style={{ transform: tapEffect ? "scale(0.95)" : "scale(1)" }}
            >
              <ChickenSilhouette gameState={gameState} chickenColor={brand.chickenColor} capacityPercent={capacityPercent} onTap={handleTap} />
            </div>

            {/* 카피 */}
            <div className="text-center mt-3">
              {capacityFull ? (
                <span className="text-sm font-bold text-red-500">바구니가 가득 찼어요! 포장해주세요</span>
              ) : (
                <span className="text-sm font-bold text-[--color-text-muted]">🤚 치킨을 눌러서 튀겨 보아요</span>
              )}
            </div>
          </div>

          {/* 지금까지 튀긴 치킨 */}
          <div className="text-center mb-5">
            <div className="text-sm font-bold text-[--color-text-muted] mb-1">지금까지 튀긴 치킨</div>
            <div className="text-4xl font-extrabold tracking-tight">
              <span style={{ color: totalCurrent > 0 ? "#333" : "#ccc" }}>
                {totalCurrent.toFixed(1)}
              </span>
              <span className="text-lg text-[--color-text-muted] ml-1">g</span>
              <span className="text-sm text-[--color-text-muted] ml-2">/ {totalRequired}g</span>
            </div>
          </div>

          {/* 포장하기 버튼 */}
          <button
            onClick={handlePackage}
            disabled={gameState.currentCapacity < GAME_CONSTANTS.MIN_PACKAGE_AMOUNT}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl border shadow-sm hover:shadow-md transition-all disabled:opacity-40 disabled:hover:shadow-sm relative mb-5"
            style={{
              borderColor: capacityFull ? brand.color : "#e8e8e8",
              backgroundColor: capacityFull ? `${brand.color}08` : "white",
            }}
          >
            <span className="text-2xl">📦</span>
            <div className="text-left">
              <span className="text-sm font-bold block">포장하기</span>
              <span className="text-[10px] text-[--color-text-muted]">바구니 비우고 치킨에 담기</span>
            </div>
            {capacityFull && (
              <span className="absolute -top-1.5 -right-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white animate-pulse" style={{ background: brand.color }}>
                가득!
              </span>
            )}
          </button>

          {/* 속도 부스트 (작게) */}
          <button
            onClick={handleBoost}
            className="w-full py-3 rounded-2xl text-sm font-bold border border-[--color-border] bg-white shadow-sm hover:shadow-md transition-all mb-5"
          >
            ⚡ 광고 보고 속도 2배 올리기
          </button>

          {/* 통계 */}
          <div className="text-center text-[11px] text-[--color-text-muted]">
            완성 치킨 {gameState.completedChickens.length}마리 · 총 탭 {gameState.totalTaps.toLocaleString()}회
          </div>
        </>
      )}

      {/* ─── 내 치킨 탭 ─── */}
      {tab === "mychicken" && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold mb-1">🍗 내 치킨</h2>
            <p className="text-sm text-[--color-text-muted]">
              지금까지 {totalCurrent.toFixed(0)}g 튀김 · 완성 {gameState.completedChickens.length}마리
            </p>
          </div>

          {/* 현재 진행 중인 치킨 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[--color-border] mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold">튀기는 중</div>
              <div className="text-sm font-extrabold" style={{ color: brand.color }}>
                {brand.meme} {brand.menu}
              </div>
            </div>
            <div className="h-3 bg-[#f0f0f0] rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, #FFD700, ${brand.color})`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-[--color-text-muted]">
              <span>{totalCurrent.toFixed(1)}g</span>
              <span>{totalRequired}g (한마리)</span>
            </div>

            {/* 부위별 진행 간단 표시 */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {PART_ORDER.map((partId) => {
                const part = gameState.parts[partId];
                const partProgress = part.required > 0 ? (part.current / part.required) * 100 : 0;
                return (
                  <div key={partId} className="text-center">
                    <div className="text-[10px] font-bold text-[--color-text-muted] mb-1">{part.name}</div>
                    <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${partProgress}%`,
                          background: part.completed ? "#4CAF50" : brand.color,
                        }}
                      />
                    </div>
                    <div className="text-[9px] text-[--color-text-muted] mt-0.5">
                      {part.completed ? "완성" : `${part.current.toFixed(0)}/${part.required}g`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 완성된 치킨 목록 */}
          {gameState.completedChickens.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-[--color-border]">
              <div className="text-6xl mb-4">🥚</div>
              <div className="text-lg font-bold mb-2">아직 완성한 치킨이 없어요</div>
              <div className="text-sm text-[--color-text-muted] mb-6">1,000g을 모으면 한마리 완성!</div>
              <button
                onClick={() => setTab("fry")}
                className="px-8 py-3 rounded-2xl text-white font-bold shadow-md"
                style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}cc)` }}
              >
                치킨 튀기러 가기
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold">완성 치킨</h3>
              {gameState.completedChickens.map((c, i) => {
                const b = getBrand(c.brandId);
                return (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-[--color-border]">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm shrink-0"
                      style={{ background: `linear-gradient(135deg, ${b?.color}20, ${b?.color}40)` }}
                    >
                      🍗
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">{b?.meme} {b?.menu}</div>
                      <div className="text-xs text-[--color-text-muted] mt-0.5">
                        {new Date(c.completedAt).toLocaleDateString("ko-KR")} 완성
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 하단 탭 네비게이션 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[--color-border] px-4 py-2 z-40">
        <div className="max-w-lg mx-auto flex">
          {([
            { key: "fry" as Tab, label: "치킨튀기기", icon: "🍗" },
            { key: "mychicken" as Tab, label: "내 치킨", icon: "📦" },
          ]).map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 transition-all"
              style={{ color: tab === item.key ? brand.color : "#8b95a1" }}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-bold">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 하단 네비 공간 확보 */}
      <div className="h-20" />
    </div>
    </>
  );
}
