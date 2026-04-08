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
    menu: "쀼링클",
    color: "#9370DB",
    chickenColor: "#DDA0DD",
    description: "시즈닝 파우더 치킨",
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
    menu: "후라이듀",
    color: "#DAA520",
    chickenColor: "#F0E68C",
    description: "정통 후라이드의 정석",
    emoji: "🦃",
  },
  {
    id: "cheogajip",
    real: "처갓집",
    meme: "쳐갓집",
    menu: "양념치킹",
    color: "#DC143C",
    chickenColor: "#FF6B6B",
    description: "새빨간 양념의 원조",
    emoji: "🥚",
  },
  {
    id: "genesis",
    real: "제네시스",
    meme: "쩨네시스",
    menu: "크리스삐",
    color: "#4169E1",
    chickenColor: "#87CEEB",
    description: "크리스피의 새로운 시작",
    emoji: "🪺",
  },
  {
    id: "norangtongdak",
    real: "노랑통닭",
    meme: "노랑똥닭",
    menu: "통째로닭",
    color: "#FFD700",
    chickenColor: "#FFEC8B",
    description: "노란 빛깔 통째로 한마리",
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
  nene: 19000,
  pelicana: 18000,
  puradak: 21000,
  hosigi: 20000,
  mexicana: 18000,
  cheogajip: 19000,
  genesis: 19000,
  norangtongdak: 17000,
};

/** 전체 평균 치킨 가격 */
export function getAverageChickenPrice(): number {
  const prices = Object.values(BRAND_PRICES);
  return Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
}
