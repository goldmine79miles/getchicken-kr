/**
 * 치킨준닭 게임 시스템
 * - 바구니 시스템 (금모으기 스타일)
 * - 속도 % 누적/감소
 * - 3-layer 저장: localStorage + backup + IndexedDB
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
    activePart: PART_ORDER[0],
    parts: createInitialParts(),
    totalCollected: 0,
    lastCollectTime: Date.now(),
    currentCapacity: 0,
    maxCapacity: GAME_CONSTANTS.INITIAL_MAX_CAPACITY,
    speedPercent: 100,
    lastSpeedUpdate: Date.now(),
    notificationEnabled: false,
    tapsRemaining: GAME_CONSTANTS.TAPS_MIN + Math.floor(Math.random() * (GAME_CONSTANTS.TAPS_MAX - GAME_CONSTANTS.TAPS_MIN + 1)),
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

// ─── 마이그레이션 ───

function migrateState(state: GameState): GameState {
  // v1 → v2: capacity/speed 필드 없으면 추가
  if (state.currentCapacity === undefined) state.currentCapacity = 0;
  if (state.maxCapacity === undefined) state.maxCapacity = GAME_CONSTANTS.INITIAL_MAX_CAPACITY;
  if (state.speedPercent === undefined) state.speedPercent = 100;
  if (state.lastSpeedUpdate === undefined) state.lastSpeedUpdate = Date.now();
  if (state.notificationEnabled === undefined) state.notificationEnabled = false;
  if (state.tapsRemaining === undefined) state.tapsRemaining = GAME_CONSTANTS.TAPS_MIN + Math.floor(Math.random() * (GAME_CONSTANTS.TAPS_MAX - GAME_CONSTANTS.TAPS_MIN + 1));
  if (!state.activePart) {
    state.activePart = PART_ORDER.find(id => !state.parts[id].completed) || PART_ORDER[0];
  }
  return state;
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
    if (raw) return migrateState(JSON.parse(raw));
  } catch {}
  const backup = loadFromBackup();
  if (backup) {
    const state = migrateState(backup);
    saveGameState(state);
    return state;
  }
  return null;
}

export async function restoreFromIDB(): Promise<GameState | null> {
  const state = await loadFromIDB();
  if (state) {
    const migrated = migrateState(state);
    saveGameState(migrated);
    return migrated;
  }
  return state;
}

// ─── 속도 시스템 ───

/** 속도 감소 적용 (시간 경과에 따라) */
function applySpeedDecay(state: GameState): void {
  const now = Date.now();
  const hoursElapsed = (now - state.lastSpeedUpdate) / (1000 * 3600);
  if (hoursElapsed > 0 && state.speedPercent > GAME_CONSTANTS.MIN_SPEED_PERCENT) {
    const decay = hoursElapsed * GAME_CONSTANTS.SPEED_DECAY_PER_HOUR;
    state.speedPercent = Math.max(GAME_CONSTANTS.MIN_SPEED_PERCENT, state.speedPercent - decay);
    state.lastSpeedUpdate = now;
  }
}

/** 현재 유효 속도 (g/s) */
export function getCurrentSpeed(state: GameState): number {
  return GAME_CONSTANTS.BASE_SPEED * (state.speedPercent / 100);
}

// ─── 바구니 시스템 ───

/** 바구니에 추가 (최대까지만) - 실제 적립된 양 반환 */
function addToCapacity(state: GameState, amount: number): number {
  const space = state.maxCapacity - state.currentCapacity;
  const actual = Math.min(amount, space);
  state.currentCapacity += actual;
  return actual;
}

/** 바구니이 꽉 찼는지 */
export function isCapacityFull(state: GameState): boolean {
  return state.currentCapacity >= state.maxCapacity - 0.001;
}

// ─── 게임 로직 ───

/** 오프라인 적립 계산 (앱 재진입 시) */
export function calculateOfflineGain(state: GameState): number {
  const now = Date.now();
  const elapsed = (now - state.lastCollectTime) / 1000;
  const maxSeconds = GAME_CONSTANTS.MAX_OFFLINE_HOURS * 3600;
  const cappedElapsed = Math.min(elapsed, maxSeconds);
  // 오프라인에서는 기본 속도만 (속도 부스트 없음)
  return cappedElapsed * GAME_CONSTANTS.BASE_SPEED;
}

/** 오프라인 적립 적용 */
export function applyOfflineGain(state: GameState): { state: GameState; gained: number } {
  const gained = calculateOfflineGain(state);
  if (gained <= 0) return { state, gained: 0 };

  const newState = { ...state, parts: { ...state.parts } };
  applySpeedDecay(newState);
  // 오프라인 적립은 바구니으로 들어감
  const actual = addToCapacity(newState, gained);
  newState.totalCollected += actual;
  newState.lastCollectTime = Date.now();
  saveGameState(newState);
  return { state: newState, gained: actual };
}

/** 랜덤 탭 수 생성 (5~10) */
function randomTapRound(): number {
  return GAME_CONSTANTS.TAPS_MIN + Math.floor(Math.random() * (GAME_CONSTANTS.TAPS_MAX - GAME_CONSTANTS.TAPS_MIN + 1));
}

/** 탭 적립 - X번 탭하면 바구니 가득 참 */
export function applyTap(state: GameState): GameState {
  if (isCapacityFull(state)) return state;
  if (state.tapsRemaining <= 0) return state;

  const newState = {
    ...state,
    totalTaps: state.totalTaps + 1,
    tapsRemaining: state.tapsRemaining - 1,
    lastCollectTime: Date.now(),
  };

  // 탭당 적립량 = 남은 용량 / 남은 탭수 (마지막 탭이면 꽉 참)
  const remaining = newState.maxCapacity - newState.currentCapacity;
  const tapAmount = newState.tapsRemaining === 0
    ? remaining  // 마지막 탭: 나머지 전부 채움
    : Math.min(GAME_CONSTANTS.TAP_AMOUNT, remaining);

  const actual = addToCapacity(newState, tapAmount);
  newState.totalCollected += actual;
  saveGameState(newState);
  return newState;
}

/** 실시간 idle 틱 (1초마다 호출) */
export function applyTick(state: GameState): GameState {
  if (isCapacityFull(state)) return state; // 바구니 꽉 참

  const newState = { ...state, lastCollectTime: Date.now() };
  applySpeedDecay(newState);
  const speed = getCurrentSpeed(newState);
  const actual = addToCapacity(newState, speed);
  newState.totalCollected += actual;
  saveGameState(newState);
  return newState;
}

/** 포장하기 (광고 시청) - 바구니를 activePart에 적립 + 바구니 리셋 */
export function packageCapacity(state: GameState): GameState {
  if (state.currentCapacity < GAME_CONSTANTS.MIN_PACKAGE_AMOUNT) return state;

  const newState = {
    ...state,
    parts: { ...state.parts },
    totalAdsWatched: state.totalAdsWatched + 1,
  };

  // 바구니을 activePart에 적립
  distributeToActivePart(newState, newState.currentCapacity);

  // 바구니 리셋 + 새 라운드 탭 수 (용량 고정)
  newState.currentCapacity = 0;
  newState.tapsRemaining = randomTapRound();

  // 모든 부위 완료 체크 → 한마리 완성
  const allCompleted = PART_ORDER.every((id) => newState.parts[id].completed);
  if (allCompleted) {
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
    newState.parts = createInitialParts();
    newState.activePart = PART_ORDER[0];
  }

  saveGameState(newState);
  return newState;
}

/** 광고로 속도 부스트 (+100%) */
export function applySpeedBoost(state: GameState): GameState {
  const newState = {
    ...state,
    speedPercent: Math.min(
      state.speedPercent + GAME_CONSTANTS.SPEED_BOOST_PER_AD,
      GAME_CONSTANTS.MAX_SPEED_PERCENT,
    ),
    lastSpeedUpdate: Date.now(),
    totalAdsWatched: state.totalAdsWatched + 1,
  };
  saveGameState(newState);
  return newState;
}

/** 적립량을 선택된 부위에 분배 */
function distributeToActivePart(state: GameState, amount: number): void {
  let remaining = amount;

  while (remaining > 0) {
    const partId = state.activePart;
    const part = state.parts[partId];

    if (part.completed) {
      // 다음 미완료 부위 찾기
      const nextPart = PART_ORDER.find(id => !state.parts[id].completed);
      if (!nextPart) return; // 모든 부위 완료
      state.activePart = nextPart;
      continue;
    }

    const newPart = { ...part };
    const space = newPart.required - newPart.current;
    const fill = Math.min(remaining, space);
    newPart.current += fill;
    remaining -= fill;

    if (newPart.current >= newPart.required) {
      newPart.current = newPart.required;
      newPart.completed = true;
      // 다음 미완료 부위로 전환
      const nextPart = PART_ORDER.find(id => !state.parts[id].completed && id !== partId);
      if (nextPart) state.activePart = nextPart;
    }

    state.parts[partId] = newPart;

    if (fill <= 0) break; // 안전장치
  }
}

/** 부위 선택 변경 */
export function selectPart(state: GameState, partId: PartId): GameState {
  if (state.parts[partId].completed) return state;
  const newState = { ...state, activePart: partId };
  saveGameState(newState);
  return newState;
}

/** 부위 전환 (토스포인트) */
export function convertPart(state: GameState, partId: PartId): { state: GameState; points: number } | null {
  const part = state.parts[partId];
  if (!part.completed) return null;

  const points = GAME_CONSTANTS.POINTS_PER_PART;
  const newState = {
    ...state,
    parts: {
      ...state.parts,
      [partId]: { ...part, completed: false, current: 0 },
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
  const newState = { ...state, selectedBrand: brandId };
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

/** 전환 가능한 부위 목록 (완료된 부위) */
export function getConvertableParts(state: GameState): PartId[] {
  return PART_ORDER.filter((id) => state.parts[id].completed);
}

/** 미전환 완성 치킨 수 */
export function getUnconvertedChickenCount(state: GameState): number {
  return state.completedChickens.filter((c) => !c.converted).length;
}

/** 알림 설정 토글 */
export function toggleNotification(state: GameState): GameState {
  const newState = { ...state, notificationEnabled: !state.notificationEnabled };
  saveGameState(newState);
  return newState;
}
