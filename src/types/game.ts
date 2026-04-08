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
  tail: "꼬리",
};

/** 부위별 필요량 (기본값) */
export const PART_REQUIREMENTS: Record<PartId, number> = {
  drumstick: 100,
  wing: 80,
  breast: 150,
  thigh: 120,
  back: 100,
  tail: 50,
};

/** 부위 목록 (순서) */
export const PART_ORDER: PartId[] = [
  "drumstick", "wing", "breast", "thigh", "back", "tail"
];

/** 게임 상수 */
export const GAME_CONSTANTS = {
  BASE_SPEED: 0.3,           // 기본 idle 속도
  TAP_AMOUNT: 2,             // 탭 1회 적립량
  BOOST_MULTIPLIER: 10,      // 광고 부스트 배율
  BOOST_DURATION: 30 * 60 * 1000, // 부스트 지속시간 30분
  MAX_OFFLINE_HOURS: 8,      // 오프라인 최대 적립 시간
  POINTS_PER_PART: 5,        // 부위 1개 전환 포인트
  POINTS_FULL_BONUS: 10,     // 한마리 완성 보너스 포인트
};
