/** 치킨 부위 ID */
export type PartId = "drumstick" | "wing" | "breast" | "thigh" | "back" | "tail";

/** 부위 상태 */
export interface PartState {
  id: PartId;
  name: string;       // 닭다리, 날개 등
  current: number;    // 현재 모은 양 (0~required)
  required: number;   // 완성에 필요한 양
  completed: boolean; // 부위 수집 완료
  packaged: boolean;  // 포장 완료 (광고 시청 후)
}

/** 완성된 치킨 */
export interface CompletedChicken {
  brandId: string;
  menuName: string;
  completedAt: number; // timestamp
  converted: boolean;  // 포인트 전환 여부
  pointsEarned: number;
}

/** 게임 전체 상태 */
export interface GameState {
  selectedBrand: string;              // 현재 모으는 브랜드 ID
  activePart: PartId;                 // 현재 선택한 부위
  parts: Record<PartId, PartState>;   // 부위별 상태
  totalCollected: number;             // 총 모은 양 (g)
  lastCollectTime: number;            // 마지막 적립 시간 (idle 계산)
  // 바구니 시스템 (튀김 바구니)
  currentCapacity: number;            // 바구니에 담긴 양 (0 ~ maxCapacity)
  maxCapacity: number;                // 바구니 최대 용량
  // 속도 시스템 (% 단위, 누적/감소)
  speedPercent: number;               // 현재 속도 (100 = 기본)
  lastSpeedUpdate: number;            // 마지막 속도 업데이트 시간
  // 알림
  notificationEnabled: boolean;       // 알림 설정 여부
  // 기타
  completedChickens: CompletedChicken[];
  convertedPoints: number;            // 전환한 총 포인트
  totalTaps: number;                  // 총 탭 수
  totalAdsWatched: number;            // 총 광고 시청 수
}

/** 브랜드 정보 */
export interface Brand {
  id: string;
  real: string;       // 실제 브랜드명 (표시 안 함)
  meme: string;       // 밈 네이밍
  menu: string;       // 대표 메뉴 밈 이름
  color: string;      // 브랜드 테마 색상
  chickenColor: string; // 치킨 채워지기 색상
  description: string;  // 한줄 설명
  emoji: string;        // 브랜드 대표 이모지
}

/** 부위 기본 정보 */
export const PART_NAMES: Record<PartId, string> = {
  drumstick: "닭다리",
  wing: "날개",
  breast: "가슴살",
  thigh: "넓적다리",
  back: "등",
  tail: "목",
};

/** 부위별 필요량 (g) - 실제 치킨 1마리 = 1,000g 기준 */
export const PART_REQUIREMENTS: Record<PartId, number> = {
  drumstick: 180,
  wing: 120,
  breast: 280,
  thigh: 200,
  back: 150,
  tail: 70,
};

/** 부위 목록 (순서) */
export const PART_ORDER: PartId[] = [
  "drumstick", "wing", "breast", "thigh", "back", "tail"
];

/** 경제 상수 */
export const GAME_CONSTANTS = {
  BASE_SPEED: 0.003,              // idle 0.003g/s (시간당 10.8g)
  TAP_AMOUNT: 0.1,                // 탭 1회 = 0.1g
  MAX_OFFLINE_HOURS: 8,           // 오프라인 최대 8시간
  POINTS_PER_PART: 50,            // 부위 1개 = 50P
  POINTS_FULL_BONUS: 200,         // 한마리 완성 보너스 = 200P (총 500P)
  // 바구니 시스템 (금모으기 비례: 금 10원/적재 → 치킨 ~10원/적재 = 0.5g)
  INITIAL_MAX_CAPACITY: 2.0,      // 초기 바구니 용량 2g (~43원 어치)
  CAPACITY_UPGRADE_PER_AD: 0.5,   // 포장 1회당 바구니 +0.5g
  MAX_CAPACITY_LIMIT: 20.0,       // 바구니 최대 상한 20g
  MIN_PACKAGE_AMOUNT: 0.5,        // 최소 포장 가능량 0.5g (~10원 어치)
  // 속도 시스템 (% 단위)
  SPEED_BOOST_PER_AD: 100,        // 광고 1회당 +100%
  SPEED_DECAY_PER_HOUR: 50,       // 시간당 -50% 감소
  MIN_SPEED_PERCENT: 100,         // 최소 속도 100%
  MAX_SPEED_PERCENT: 5000,        // 최대 속도 5000%
};
