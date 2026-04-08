"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { GameState, PartId } from "@/types/game";
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
  convertPart,
  convertChicken,
  changeBrand,
  getTotalProgress,
  getConvertableParts,
  getUnconvertedChickenCount,
  isCapacityFull,
  getCurrentSpeed,
  toggleNotification,
} from "@/lib/gameSystem";
import ChickenSilhouette from "./ChickenSilhouette";
import BrandCard from "./BrandCard";

type Tab = "fry" | "collection" | "convert";

export default function GameClient() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [tab, setTab] = useState<Tab>("fry");
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

  const handleNotification = useCallback(async () => {
    if (typeof Notification !== "undefined" && Notification.permission !== "granted") {
      await Notification.requestPermission();
    }
    setGameState((prev) => (prev ? toggleNotification(prev) : prev));
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
              치킨 튀겨서<br />치킨 받자
            </h1>
            <p className="text-lg md:text-xl text-[--color-text-secondary] max-w-lg mx-auto mb-10">
              좋아하는 브랜드 치킨을 직접 튀겨 모으면,<br className="hidden md:block" />
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
                { step: "3", emoji: "📦", title: "포장하기", desc: "적재량이 차면 포장해요" },
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

      {/* 전환 메시지 토스트 */}
      {convertMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg border"
          style={{ borderColor: `${brand.color}40`, color: brand.color }}>
          {convertMsg}
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
            {/* 최대 적재량 + 튀기는 속도 */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF3E0] text-[#E65100]">튀김 바구니</span>
                <span className="text-sm font-bold">{gameState.currentCapacity.toFixed(1)}g / {gameState.maxCapacity.toFixed(0)}g</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E3F2FD] text-[#1565C0]">튀기는 속도</span>
                <span className="text-sm font-bold">{Math.round(gameState.speedPercent).toLocaleString()}%</span>
              </div>
            </div>

            {/* 적재량 바 */}
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
              <ChickenSilhouette gameState={gameState} chickenColor={brand.chickenColor} onTap={handleTap} />
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

          {/* 알림설정 + 포장하기 버튼 2개 */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              onClick={handleNotification}
              className="flex flex-col items-center gap-1.5 p-4 rounded-2xl border border-[--color-border] bg-white shadow-sm hover:shadow-md transition-all"
            >
              <span className="text-2xl">⚡</span>
              <span className="text-sm font-bold">
                {gameState.notificationEnabled ? "알림 설정 완료!" : "알림 설정"}
              </span>
              <span className="text-[10px] text-[--color-text-muted]">쉬었다 와도 돼요</span>
            </button>
            <button
              onClick={handlePackage}
              disabled={gameState.currentCapacity < GAME_CONSTANTS.MIN_PACKAGE_AMOUNT}
              className="flex flex-col items-center gap-1.5 p-4 rounded-2xl border shadow-sm hover:shadow-md transition-all disabled:opacity-40 disabled:hover:shadow-sm relative"
              style={{
                borderColor: capacityFull ? brand.color : "#e8e8e8",
                backgroundColor: capacityFull ? `${brand.color}08` : "white",
              }}
            >
              {capacityFull && (
                <span className="absolute -top-1.5 -right-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white" style={{ background: brand.color }}>
                  AD
                </span>
              )}
              <span className="text-2xl">📦</span>
              <span className="text-sm font-bold">포장하기</span>
              <span className="text-[10px] text-[--color-text-muted]">바구니 비우기</span>
            </button>
          </div>

          {/* 속도 부스트 (작게) */}
          <button
            onClick={handleBoost}
            className="w-full py-3 rounded-2xl text-sm font-bold border border-[--color-border] bg-white shadow-sm hover:shadow-md transition-all mb-5"
          >
            ⚡ 광고 보고 속도 +{GAME_CONSTANTS.SPEED_BOOST_PER_AD}% 올리기
          </button>

          {/* 앱접속중이 아니어도 튀기기 */}
          <div className="text-center text-[11px] text-[--color-text-muted]">
            앱접속중이 아니어도 튀기기 · 완성 치킨 {gameState.completedChickens.length}마리 · 누적 {gameState.convertedPoints}P
          </div>
        </>
      )}

      {/* ─── 컬렉션 탭 ─── */}
      {tab === "collection" && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold mb-1">🏆 내 컬렉션</h2>
            <p className="text-sm text-[--color-text-muted]">완성한 치킨 {gameState.completedChickens.length}마리</p>
          </div>
          {gameState.completedChickens.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-[--color-border]">
              <div className="text-7xl mb-5">🥚</div>
              <div className="text-xl font-bold mb-2">아직 완성한 치킨이 없어요</div>
              <div className="text-sm text-[--color-text-muted] mb-8">열심히 튀겨서 첫 치킨을 완성해보세요!</div>
              <button
                onClick={() => setTab("fry")}
                className="px-8 py-3.5 rounded-2xl text-white font-bold shadow-md"
                style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}cc)` }}
              >
                치킨 튀기러 가기
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {gameState.completedChickens.map((c, i) => {
                const b = getBrand(c.brandId);
                return (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-[--color-border]">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0"
                      style={{ background: `linear-gradient(135deg, ${b?.color}20, ${b?.color}40)` }}
                    >
                      {c.converted ? "✅" : "🍗"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">{b?.meme} {b?.menu}</div>
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

      {/* ─── 전환 탭 ─── */}
      {tab === "convert" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold mb-1">💰 포인트 전환</h2>
              <p className="text-sm text-[--color-text-muted]">완성된 부위나 치킨을 포인트로 전환</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-[--color-text-muted]">누적 전환</div>
              <div className="text-xl font-extrabold" style={{ color: brand.color }}>{gameState.convertedPoints}P</div>
            </div>
          </div>

          {getConvertableParts(gameState).length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold mb-3">완성 부위</h3>
              <div className="flex flex-col gap-2.5">
                {getConvertableParts(gameState).map((partId) => (
                  <div key={partId} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-[--color-border]">
                    <div>
                      <div className="text-sm font-bold">{gameState.parts[partId].name}</div>
                      <div className="text-xs text-[--color-text-muted]">{GAME_CONSTANTS.POINTS_PER_PART}P 전환 가능</div>
                    </div>
                    <button
                      onClick={() => handleConvertPart(partId)}
                      className="px-5 py-2 rounded-xl text-white text-sm font-bold shadow-sm"
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
            <div className="mb-6">
              <h3 className="text-sm font-bold mb-3">완성 치킨</h3>
              <div className="flex flex-col gap-2.5">
                {gameState.completedChickens.map((c, i) => {
                  if (c.converted) return null;
                  const b = getBrand(c.brandId);
                  const total = 6 * GAME_CONSTANTS.POINTS_PER_PART + GAME_CONSTANTS.POINTS_FULL_BONUS;
                  return (
                    <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-[--color-border]">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🍗</span>
                        <div>
                          <div className="text-sm font-bold">{b?.meme} {b?.menu}</div>
                          <div className="text-xs text-[--color-text-muted]">{total}P (보너스 포함)</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleConvertChicken(i)}
                        className="px-5 py-2 rounded-xl text-white text-sm font-bold shadow-sm"
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
              <div className="text-sm text-[--color-text-muted] mb-8">치킨을 튀겨서 부위를 완성하면 전환할 수 있어요</div>
              <button
                onClick={() => setTab("fry")}
                className="px-8 py-3.5 rounded-2xl text-white font-bold shadow-md"
                style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}cc)` }}
              >
                치킨 튀기러 가기
              </button>
            </div>
          )}
        </div>
      )}

      {/* 하단 탭 네비게이션 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[--color-border] px-4 py-2 z-40">
        <div className="max-w-lg mx-auto flex">
          {([
            { key: "fry" as Tab, label: "치킨튀기기", icon: "🍗" },
            { key: "collection" as Tab, label: "컬렉션", icon: "🏆" },
            { key: "convert" as Tab, label: "전환", icon: "💰" },
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
  );
}
