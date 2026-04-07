/**
 * 치킨준닭 게임 시스템
 * - idle 적립 (오프라인 포함)
 * - 3-layer 저장: localStorage + backup + IndexedDB
 * - 부위별 수집 → 포장 → 완성 → 포인트 전환
 */

import type { GameState, PartId, PartState } from "@/types/game";
import { PART_NAMES, PART_REQUIREMENTS, PART_ORDER, GAME_CONSTANTS } from "@/types/game";

const STORAGE_KEY = "chikin_game";
const BACKUP_KEY = "_ck_v2";
const IDB_NAME = "ck_db";
const IDB_STORE = "s";

// ─── 초기 상태 생성 ───

function createInitialParts(): Record<PartId, PartState> {
  const parts = {} as Record<PartId, PartState>;
  for (const id of PART_ORDER) {
    parts[id] = {
      id,
      name: PART_NAMES[id],
      current: 0,
      required: PART_REQUIREMENTS[id],
      completed: false,
      packaged: false,
    };
  }
  return parts;
}

function createInitialState(brandId: string): GameState {
  return {
    selectedBrand: brandId,
    parts: createInitialParts(),
    totalCollected: 0,
    lastCollectTime: Date.now(),
    speedBoost: 1,
    speedBoostExpiry: 0,
    completedChickens: [],
    convertedPoints: 0,
    totalTaps: 0,
    totalAdsWatched: 0,
  };
}

// ─── 3-Layer 저장 시스템 ───

function makeHash(data: string): string {
  let h = 0;
  for (let i = 0; i < data.length; i++) {
    h = ((h << 5) - h + data.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

function saveToBackup(state: GameState): void {
  try {
    const json = JSON.stringify(state);
    const encoded = btoa(unescape(encodeURIComponent(json)));
    const hash = makeHash(json);
    localStorage.setItem(BACKUP_KEY, `${hash}:${encoded}`);
  } catch {}
}

function loadFromBackup(): GameState | null {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (!raw) return null;
    const [hash, encoded] = raw.split(":");
    const json = decodeURIComponent(escape(atob(encoded)));
    if (makeHash(json) !== hash) return null;
    return JSON.parse(json);
  } catch {
    return null;
  }
}

async function saveToIDB(state: GameState): Promise<void> {
  try {
    const db = await openIDB();
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put({
      k: "game",
      d: JSON.stringify(state),
      h: makeHash(JSON.stringify(state)),
    });
  } catch {}
}

async function loadFromIDB(): Promise<GameState | null> {
  try {
    const db = await openIDB();
    const tx = db.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get("game");
    return new Promise((resolve) => {
      req.onsuccess = () => {
        if (!req.result) return resolve(null);
        const { d, h } = req.result;
        if (makeHash(d) !== h) return resolve(null);
        resolve(JSON.parse(d));
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: "k" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ─── 로드 / 저장 ───

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    saveToBackup(state);
    saveToIDB(state).catch(() => {});
  } catch {}
}

export function loadGameState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  // backup fallback
  const backup = loadFromBackup();
  if (backup) {
    saveGameState(backup);
    return backup;
  }

  return null;
}

export async function restoreFromIDB(): Promise<GameState | null> {
  const state = await loadFromIDB();
  if (state) saveGameState(state);
  return state;
}

// ─── 게임 로직 ───

/** 현재 유효 속도 (부스트 포함) */
export function getCurrentSpeed(state: GameState): number {
  const now = Date.now();
  const boost = now < state.speedBoostExpiry ? state.speedBoost : 1;
  return GAME_CONSTANTS.BASE_SPEED * boost;
}

/** 오프라인 적립 계산 (앱 재진입 시) */
export function calculateOfflineGain(state: GameState): number {
  const now = Date.now();
  const elapsed = (now - state.lastCollectTime) / 1000; // 초
  const maxSeconds = GAME_CONSTANTS.MAX_OFFLINE_HOURS * 3600;
  const cappedElapsed = Math.min(elapsed, maxSeconds);
  // 오프라인에서는 부스트 적용 안 함 (기본 속도만)
  return cappedElapsed * GAME_CONSTANTS.BASE_SPEED;
}

/** 오프라인 적립 적용 */
export function applyOfflineGain(state: GameState): { state: GameState; gained: number } {
  const gained = calculateOfflineGain(state);
  if (gained <= 0) return { state, gained: 0 };

  const newState = { ...state, parts: { ...state.parts } };
  distributeToActivePart(newState, gained);
  newState.totalCollected += gained;
  newState.lastCollectTime = Date.now();
  saveGameState(newState);
  return { state: newState, gained };
}

/** 탭 적립 */
export function applyTap(state: GameState): GameState {
  const newState = {
    ...state,
    parts: { ...state.parts },
    totalTaps: state.totalTaps + 1,
    lastCollectTime: Date.now(),
  };
  const amount = GAME_CONSTANTS.TAP_AMOUNT;
  distributeToActivePart(newState, amount);
  newState.totalCollected += amount;
  saveGameState(newState);
  return newState;
}

/** 실시간 idle 틱 (1초마다 호출) */
export function applyTick(state: GameState): GameState {
  const speed = getCurrentSpeed(state);
  const newState = {
    ...state,
    parts: { ...state.parts },
    lastCollectTime: Date.now(),
  };
  distributeToActivePart(newState, speed);
  newState.totalCollected += speed;
  saveGameState(newState);
  return newState;
}

/** 적립량을 현재 활성 부위에 분배 */
function distributeToActivePart(state: GameState, amount: number): void {
  // 아직 완성 안 된 첫 번째 부위에 할당
  for (const partId of PART_ORDER) {
    const part = state.parts[partId];
    if (part.completed) continue;

    const newPart = { ...part };
    newPart.current = Math.min(newPart.current + amount, newPart.required);
    if (newPart.current >= newPart.required) {
      newPart.current = newPart.required;
      newPart.completed = true;
    }
    state.parts[partId] = newPart;
    return;
  }
}

/** 부위 포장하기 (광고 시청 후) */
export function packagePart(state: GameState, partId: PartId): GameState | null {
  const part = state.parts[partId];
  if (!part.completed || part.packaged) return null;

  const newState = {
    ...state,
    parts: {
      ...state.parts,
      [partId]: { ...part, packaged: true },
    },
    totalAdsWatched: state.totalAdsWatched + 1,
  };

  // 모든 부위 포장 완료 → 한마리 완성
  const allPackaged = PART_ORDER.every((id) => newState.parts[id].packaged);
  if (allPackaged) {
    newState.completedChickens = [
      ...newState.completedChickens,
      {
        brandId: state.selectedBrand,
        menuName: "",
        completedAt: Date.now(),
        converted: false,
        pointsEarned: 0,
      },
    ];
    // 부위 리셋 (새로운 치킨 시작)
    newState.parts = createInitialParts();
  }

  saveGameState(newState);
  return newState;
}

/** 광고 부스트 적용 */
export function applySpeedBoost(state: GameState): GameState {
  const newState = {
    ...state,
    speedBoost: GAME_CONSTANTS.BOOST_MULTIPLIER,
    speedBoostExpiry: Date.now() + GAME_CONSTANTS.BOOST_DURATION,
    totalAdsWatched: state.totalAdsWatched + 1,
  };
  saveGameState(newState);
  return newState;
}

/** 부위 전환 (토스포인트) */
export function convertPart(state: GameState, partId: PartId): { state: GameState; points: number } | null {
  const part = state.parts[partId];
  if (!part.packaged) return null;

  const points = GAME_CONSTANTS.POINTS_PER_PART;
  const newState = {
    ...state,
    parts: {
      ...state.parts,
      [partId]: { ...part, packaged: false, completed: false, current: 0 },
    },
    convertedPoints: state.convertedPoints + points,
  };
  saveGameState(newState);
  return { state: newState, points };
}

/** 완성 치킨 전환 (보너스 포함) */
export function convertChicken(state: GameState, index: number): { state: GameState; points: number } | null {
  const chicken = state.completedChickens[index];
  if (!chicken || chicken.converted) return null;

  const partPoints = PART_ORDER.length * GAME_CONSTANTS.POINTS_PER_PART;
  const bonus = GAME_CONSTANTS.POINTS_FULL_BONUS;
  const totalPoints = partPoints + bonus;

  const newChickens = [...state.completedChickens];
  newChickens[index] = { ...chicken, converted: true, pointsEarned: totalPoints };

  const newState = {
    ...state,
    completedChickens: newChickens,
    convertedPoints: state.convertedPoints + totalPoints,
  };
  saveGameState(newState);
  return { state: newState, points: totalPoints };
}

/** 브랜드 변경 */
export function changeBrand(state: GameState, brandId: string): GameState {
  const newState = {
    ...state,
    selectedBrand: brandId,
  };
  saveGameState(newState);
  return newState;
}

/** 새 게임 시작 */
export function startNewGame(brandId: string): GameState {
  const state = createInitialState(brandId);
  saveGameState(state);
  return state;
}

/** 전체 진행률 (%) */
export function getTotalProgress(state: GameState): number {
  const totalRequired = PART_ORDER.reduce((sum, id) => sum + state.parts[id].required, 0);
  const totalCurrent = PART_ORDER.reduce((sum, id) => sum + state.parts[id].current, 0);
  return totalRequired > 0 ? (totalCurrent / totalRequired) * 100 : 0;
}

/** 현재 활성 부위 ID */
export function getActivePart(state: GameState): PartId | null {
  for (const partId of PART_ORDER) {
    if (!state.parts[partId].completed) return partId;
  }
  return null;
}

/** 전환 가능한 부위 목록 */
export function getConvertableParts(state: GameState): PartId[] {
  return PART_ORDER.filter((id) => state.parts[id].packaged);
}

/** 미전환 완성 치킨 수 */
export function getUnconvertedChickenCount(state: GameState): number {
  return state.completedChickens.filter((c) => !c.converted).length;
}
