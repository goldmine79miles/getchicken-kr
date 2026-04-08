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
  speedBoost: number;                 // 광고 부스트 배율 (기본 1)
  speedBoostExpiry: number;           // 부스트 만료 시간
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

/** 경제 상수 - 금모으기 수준으로 찔끔 적립 */
export const GAME_CONSTANTS = {
  BASE_SPEED: 0.003,         // idle 0.003g/s (시간당 10.8g)
  TAP_AMOUNT: 0.1,           // 탭 1회 = 0.1g (전체 0.01%)
  BOOST_MULTIPLIER: 10,      // 광고 부스트 10x
  BOOST_DURATION: 30 * 60 * 1000, // 부스트 30분
  MAX_OFFLINE_HOURS: 8,      // 오프라인 최대 8시간
  POINTS_PER_PART: 50,       // 부위 1개 = 50P
  POINTS_FULL_BONUS: 200,    // 한마리 완성 보너스 = 200P (총 500P)
};
