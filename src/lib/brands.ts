import type { Brand } from "@/types/game";

export const BRANDS: Brand[] = [
  {
    id: "bbq",
    real: "BBQ",
    meme: "삐삐큐",
    menu: "황끔올리뷔",
    color: "#8B4513",
    chickenColor: "#D4A017",
    description: "바삭한 황금빛 올리브 치킨",
    emoji: "🍗",
  },
  {
    id: "bhc",
    real: "BHC",
    meme: "삐에이취씨",
    menu: "뿌릉클",
    color: "#FF69B4",
    chickenColor: "#FFB6C1",
    description: "달콤한 핑크빛 크리스피",
    emoji: "🍖",
  },
  {
    id: "kyochon",
    real: "교촌",
    meme: "꾜촌",
    menu: "허늬콤보",
    color: "#C8102E",
    chickenColor: "#E8A87C",
    description: "꿀처럼 달콤한 간장 치킨",
    emoji: "🐔",
  },
  {
    id: "goobne",
    real: "굽네",
    meme: "꿉네",
    menu: "고츄바사사삭",
    color: "#FF4500",
    chickenColor: "#FF6347",
    description: "매콤하게 구운 바삭 치킨",
    emoji: "🐓",
  },
  {
    id: "nene",
    real: "네네",
    meme: "녜녜",
    menu: "오린엔탈파닭",
    color: "#9370DB",
    chickenColor: "#DDA0DD",
    description: "오리엔탈 소스의 파닭",
    emoji: "🐤",
  },
  {
    id: "pelicana",
    real: "페리카나",
    meme: "펠리카냐",
    menu: "양념반후반",
    color: "#FF8C00",
    chickenColor: "#FFA500",
    description: "양념과 후라이드의 클래식 조합",
    emoji: "🐥",
  },
  {
    id: "puradak",
    real: "푸라닭",
    meme: "뿌라닭",
    menu: "블랙알릭",
    color: "#2F4F4F",
    chickenColor: "#696969",
    description: "블랙 마늘의 깊은 풍미",
    emoji: "🥩",
  },
  {
    id: "hosigi",
    real: "호식이",
    meme: "홓식이",
    menu: "두마리치킹",
    color: "#228B22",
    chickenColor: "#90EE90",
    description: "두 마리라 더 행복한 치킨",
    emoji: "🐣",
  },
  {
    id: "mexicana",
    real: "멕시카나",
    meme: "맥시카냐",
    menu: "와삭칸",
    color: "#DAA520",
    chickenColor: "#F0E68C",
    description: "와삭하게 튀긴 정통 치킨",
    emoji: "🦃",
  },
  {
    id: "jicoba",
    real: "지코바",
    meme: "찌코바",
    menu: "양념치킹",
    color: "#DC143C",
    chickenColor: "#FF6B6B",
    description: "새빨간 양념의 매운맛",
    emoji: "🥚",
  },
  {
    id: "60gye",
    real: "60계치킨",
    meme: "육공계",
    menu: "크크크치킹",
    color: "#4169E1",
    chickenColor: "#87CEEB",
    description: "크리스피의 삼중 바삭함",
    emoji: "🪺",
  },
  {
    id: "kkanbu",
    real: "깐부치킨",
    meme: "깐부",
    menu: "깐부통닭",
    color: "#FFD700",
    chickenColor: "#FFEC8B",
    description: "통째로 한마리 깐부 치킨",
    emoji: "🦴",
  },
];

/** 브랜드 ID로 찾기 */
export function getBrand(id: string): Brand | undefined {
  return BRANDS.find((b) => b.id === id);
}

/** 브랜드별 평균 시중 가격 (원) - 정보 표시용 */
export const BRAND_PRICES: Record<string, number> = {
  bbq: 22000,
  bhc: 20000,
  kyochon: 21000,
  goobne: 20000,
  nene: 23000,
  pelicana: 18000,
  puradak: 21000,
  hosigi: 20000,
  mexicana: 21000,
  jicoba: 22500,
  "60gye": 21900,
  kkanbu: 19000,
};

/** 전체 평균 치킨 가격 */
export function getAverageChickenPrice(): number {
  const prices = Object.values(BRAND_PRICES);
  return Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
}
