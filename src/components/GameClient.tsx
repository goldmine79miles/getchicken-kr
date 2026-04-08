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
  isCapacityFull,
  getCurrentSpeed,
  refillTaps,
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
  const [showPriceList, setShowPriceList] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [smoothTotal, setSmoothTotal] = useState(0);
  const smoothRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());

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

  // gameState를 ref로 추적 (애니메이션에서 최신값 읽기 위해)
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // 카운터 표시용 (실제값 + 코스메틱 마지막 4자리)
  const [counterDisplay, setCounterDisplay] = useState("0.0000000000");

  // 부드러운 카운터 애니메이션 (매 프레임 보간)
  useEffect(() => {
    let animId: number;
    let running = true;

    const animate = () => {
      if (!running) return;
      const gs = gameStateRef.current;
      if (!gs) { animId = requestAnimationFrame(animate); return; }

      const now = performance.now();
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      const speed = getCurrentSpeed(gs);
      const isFull = gs.currentCapacity >= gs.maxCapacity - 0.001;
      const base = gs.currentCapacity; // 튀김통만 (포장하면 0으로 리셋)

      // 포장으로 리셋되면 즉시 동기화, 아니면 보간
      if (smoothRef.current > base + 0.01) {
        smoothRef.current = base; // 포장 후 리셋
      } else if (smoothRef.current < base - 0.001) {
        smoothRef.current = base;
      } else if (!isFull && dt < 0.5) {
        smoothRef.current += speed * dt;
      }

      // 실제 보간값 11자리 (마지막 자리까지 부드럽게)
      setCounterDisplay(smoothRef.current.toFixed(11));

      animId = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animId = requestAnimationFrame(animate);
    return () => { running = false; cancelAnimationFrame(animId); };
  }, []); // 한번만 시작, ref로 최신 state 읽음

  const handleTap = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return prev;
      // 탭 소진 → 치킨 누르면 바로 광고(탭 충전)
      if (prev.tapsRemaining <= 0) return refillTaps(prev);
      return applyTap(prev);
    });
    setTapEffect(true);
    setTimeout(() => setTapEffect(false), 150);
  }, []);

  const handlePackage = useCallback(() => {
    setGameState((prev) => (prev ? packageCapacity(prev) : prev));
  }, []);

  const handleBoost = useCallback(() => {
    setGameState((prev) => (prev ? applySpeedBoost(prev) : prev));
  }, []);

  const handleRefillTaps = useCallback(() => {
    setGameState((prev) => (prev ? refillTaps(prev) : prev));
  }, []);



  const handleGoHome = useCallback(() => {
    localStorage.removeItem("chikin_game");
    localStorage.removeItem("_ck_v2");
    try { indexedDB.deleteDatabase("ck_db"); } catch {}
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
                { step: "3", emoji: "box", title: "포장하기", desc: "치킨이 튀겨지면 상자에 담아요" },
                { step: "4", emoji: "🍗", title: "치킨 완성", desc: "1,000g 모으면 한마리 완성!" },
              ].map((item) => (
                <div key={item.step} className="bg-[--color-bg] rounded-2xl p-6">
                  <div className="text-4xl mb-3">
                    {item.emoji === "box" ? (
                      <img src="/chicken-box.png" alt="치킨상자" className="w-12 h-12 object-contain mx-auto mix-blend-multiply" />
                    ) : item.emoji}
                  </div>
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
              {/* Coming Soon 빈 카드 */}
              {[1, 2].map((i) => (
                <div
                  key={`coming-${i}`}
                  className="relative p-4 rounded-2xl text-center border-2 border-dashed border-[#e0e0e0] flex flex-col items-center justify-center"
                  style={{ minHeight: 160 }}
                >
                  <div className="text-3xl mb-2 opacity-30">🍗</div>
                  <div className="text-sm font-bold text-[--color-text-muted]">Next Brand ?</div>
                  <div className="text-[11px] text-[--color-text-muted] mt-1">Coming Soon</div>
                </div>
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
    <div className="max-w-lg mx-auto px-4 py-6 overflow-x-hidden">
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
          {/* 오늘의 치킨 평균 시세 (클릭 → 브랜드별 정가) */}
          <button
            onClick={() => setShowPriceList(!showPriceList)}
            className="w-full text-center mb-4 hover:opacity-80 transition-opacity"
          >
            <div className="text-xs text-[--color-text-muted]">오늘의 치킨 평균 시세</div>
            <div className="text-2xl font-extrabold">{avgPrice.toLocaleString()}원 <span className="text-sm text-[--color-text-muted]">▼</span></div>
          </button>

          {/* 브랜드별 정가 리스트 */}
          {showPriceList && (
            <div className="mb-5 bg-white rounded-2xl p-4 shadow-lg border border-[--color-border]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold">브랜드별 치킨 정가</h3>
                <button onClick={() => setShowPriceList(false)} className="text-[--color-text-muted] hover:text-[--color-text-primary] text-lg">✕</button>
              </div>
              <div className="max-h-[250px] overflow-y-auto">
                {BRANDS.map((b) => {
                  const price = BRAND_PRICES[b.id] || 0;
                  return (
                    <div key={b.id} className="flex items-center justify-between py-2 border-b border-[#f0f0f0] last:border-0">
                      <div>
                        <span className="text-sm font-bold">{b.real}</span>
                        <span className="text-xs text-[--color-text-muted] ml-1">{b.realMenu}</span>
                      </div>
                      <span className="text-sm font-extrabold shrink-0">{price.toLocaleString()}원</span>
                    </div>
                  );
                })}
              </div>
              <div className="text-[10px] text-[--color-text-muted] mt-2 text-center">
                평균 {avgPrice.toLocaleString()}원 · 대표 메뉴 기준
              </div>
            </div>
          )}

          {/* 먹고 싶은 닭을 튀겨보세요 + 브랜드 드롭다운 */}
          <div className="text-center mb-5">
            <button
              onClick={() => setShowBrandPicker(!showBrandPicker)}
              className="inline-flex flex-col items-center gap-1.5 px-5 py-2.5 rounded-2xl text-sm font-bold border border-[--color-border] bg-white shadow-sm hover:shadow-md transition-all"
            >
              <span className="flex items-center gap-1">
                <span>먹고 싶은 닭을 튀겨보세요</span>
                <span className="text-lg">🍗</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="px-2.5 py-0.5 rounded-lg text-white text-xs font-extrabold"
                  style={{ background: brand.color }}
                >
                  {brand.meme} {brand.menu}
                </span>
                <span className="text-xs text-[--color-text-muted]">▼</span>
              </span>
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
                {BRANDS.map((b) => (
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
                    </button>
                  ))}
                  {/* Coming Soon */}
                  {[1, 2].map((i) => (
                    <div
                      key={`coming-${i}`}
                      className="p-3 rounded-xl text-center border-2 border-dashed border-[#e0e0e0] flex flex-col items-center justify-center"
                    >
                      <div className="text-lg opacity-30">🍗</div>
                      <div className="text-[10px] font-bold text-[--color-text-muted]">Coming Soon</div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 인기 랭킹 */}
          <div className="mb-4 p-3 bg-white rounded-2xl border border-[--color-border] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-extrabold">🔥 실시간 인기 치킨</div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#FFF3E0] text-[#E65100]">LIVE</span>
            </div>
            <div className="flex gap-2">
              {[
                { rank: 1, name: "삐삐큐", pct: 18 },
                { rank: 2, name: "삐에이취씨", pct: 15 },
                { rank: 3, name: "꾜촌", pct: 14 },
              ].map((item) => (
                <div key={item.rank} className="flex-1 text-center py-1.5 rounded-lg bg-[#fafafa]">
                  <div className="text-[10px] font-extrabold" style={{ color: item.rank === 1 ? "#FF6B35" : "#666" }}>
                    {item.rank}위
                  </div>
                  <div className="text-xs font-bold">{item.name}</div>
                  <div className="text-[9px] text-[--color-text-muted]">{item.pct}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* 메인 카드 */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[--color-border] mb-5 overflow-hidden">
            {/* 튀김통 + 튀기는 속도 (g/hr) */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-[10px] font-bold text-[#E65100] mb-0.5">튀김통 최대 용량</div>
                <div className="text-lg font-extrabold">{gameState.maxCapacity.toFixed(1)}g</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-[#1565C0] mb-0.5">튀기는 속도</div>
                <div className="text-lg font-extrabold">{(getCurrentSpeed(gameState) * 3600).toFixed(1)}g/hr</div>
              </div>
            </div>

            {/* 튀김통 바 */}
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

            {/* 카피 + 탭소진 시 바로 광고 버튼 */}
            <div className="text-center mt-3">
              {capacityFull ? (
                <span className="text-sm font-bold text-red-500">튀김통이 가득 찼어요! 포장하면 더 튀길 수 있어요</span>
              ) : gameState.tapsRemaining <= 0 ? (
                <button
                  onClick={handleRefillTaps}
                  className="px-5 py-2.5 rounded-xl text-sm font-extrabold text-white shadow-md active:scale-95 transition-transform"
                  style={{ background: "linear-gradient(135deg, #FF6B35, #FF8F5E)" }}
                >
                  ⚡ 광고 보고 더 튀기기
                </button>
              ) : (
                <span className="text-sm font-bold text-[--color-text-muted]">
                  🤚 치킨을 {gameState.tapsRemaining}번 눌러주세요
                </span>
              )}
            </div>
          </div>

          {/* 튀김통 오도미터 */}
          <div className="text-center mb-5">
            <div className="text-sm font-bold text-[--color-text-muted] mb-2">지금까지 튀겨진 {brand.real} {brand.realMenu}</div>
            <div className="flex items-center justify-center bg-[#1a1a1a] rounded-2xl px-3 py-3 shadow-inner overflow-hidden">
              {(() => {
                const total = counterDisplay;
                const [intPart, decPart] = total.split(".");
                const chars = (intPart + "." + decPart).split("");
                const intLen = intPart.length;
                return chars.map((ch, i) => {
                  const isDot = ch === ".";
                  const isInt = i < intLen;
                  const decIdx = isDot ? -1 : i - intLen - 1;
                  const fontSize = isDot ? 16 : isInt ? 26 : Math.max(13, 22 - decIdx * 1);
                  return (
                    <span
                      key={i}
                      className="font-mono font-extrabold inline-block leading-none"
                      style={{
                        fontSize,
                        color: "#FF8F00",
                        textShadow: !isDot ? "0 0 8px rgba(255,143,0,0.3)" : "none",
                        width: isDot ? 8 : undefined,
                        textAlign: "center",
                      }}
                    >
                      {ch}
                    </span>
                  );
                });
              })()}
              <span className="text-sm font-bold text-[#666] ml-1">g</span>
            </div>
          </div>

          {/* 2버튼: 빠르게 튀기기 + 포장하기 (금모으기 스타일) */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {/* 빠르게 튀기기 */}
            <button
              onClick={gameState.tapsRemaining <= 0 && !capacityFull ? handleRefillTaps : handleBoost}
              className="relative p-4 rounded-2xl border border-[--color-border] bg-white shadow-sm hover:shadow-md transition-all text-center"
            >
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-sm font-extrabold">빠르게 튀기기</div>
              <div className="text-[10px] text-[--color-text-muted] mt-0.5">
                {gameState.tapsRemaining <= 0 && !capacityFull
                  ? "탭 충전하기"
                  : `속도 + ${GAME_CONSTANTS.SPEED_BOOST_PER_AD.toLocaleString()}%`}
              </div>
              <span className="absolute -top-1.5 -right-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white bg-[#2196F3]">
                AD
              </span>
            </button>

            {/* 포장하기 */}
            <button
              onClick={handlePackage}
              disabled={gameState.currentCapacity < GAME_CONSTANTS.MIN_PACKAGE_AMOUNT}
              className="relative p-4 rounded-2xl border shadow-sm hover:shadow-md transition-all text-center disabled:opacity-40 disabled:hover:shadow-sm"
              style={{
                borderColor: capacityFull ? brand.color : "#e8e8e8",
                backgroundColor: capacityFull ? `${brand.color}08` : "white",
              }}
            >
              <div className="mb-1"><img src="/chicken-box.png" alt="" className="w-12 h-12 object-contain mx-auto mix-blend-multiply" /></div>
              <div className="text-sm font-extrabold">포장하기</div>
              <div className="text-[10px] text-[--color-text-muted] mt-0.5">튀김통의 치킨 적립</div>
              <span
                className="absolute -top-1.5 -right-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white"
                style={{
                  background: capacityFull ? brand.color : "#aaa",
                  animation: capacityFull ? "pulse 2s infinite" : "none",
                }}
              >
                AD
              </span>
            </button>
          </div>

          {/* 포장 완료 총량 (금모으기 하단 스타일) */}
          <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-[--color-border] shadow-sm">
            <img src="/chicken-box.png" alt="" className="w-12 h-12 object-contain mix-blend-multiply shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-extrabold">
                치킨 <span style={{ color: brand.color }}>{(totalCurrent / 1000).toFixed(2)}</span>마리 포장했어요
              </div>
              <div className="text-[11px] text-[--color-text-muted]">
                {totalCurrent.toFixed(1)}g 모음 · 1,000g이면 한마리 완성
              </div>
            </div>
            <span className="text-lg">›</span>
          </div>

        </>
      )}

      {/* ─── 내 치킨 탭 ─── */}
      {tab === "mychicken" && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold mb-1">🍗 내 치킨</h2>
            <p className="text-sm text-[--color-text-muted]">
              {(totalCurrent / 1000).toFixed(2)}마리 ({totalCurrent.toFixed(1)}g) · 완성 {gameState.completedChickens.length}마리
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
            { key: "mychicken" as Tab, label: "내 치킨", icon: "box" },
          ]).map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 transition-all"
              style={{ color: tab === item.key ? brand.color : "#8b95a1" }}
            >
              {item.icon === "box" ? (
                <img src="/chicken-box.png" alt="" className="w-8 h-8 object-contain mix-blend-multiply" style={{ opacity: tab === item.key ? 1 : 0.5 }} />
              ) : (
                <span className="text-xl">{item.icon}</span>
              )}
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
