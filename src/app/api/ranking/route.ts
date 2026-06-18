import { NextResponse } from "next/server";
import { getActiveBrandCounts } from "@/lib/kv";

/** 브랜드별 실시간 인기 랭킹 (최근 24시간 활성 유저 기준) */
export async function GET() {
  try {
    const now = Date.now();
    const sinceMs = now - 24 * 3600 * 1000;
    const counts = await getActiveBrandCounts(sinceMs, now);

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const total = sorted.reduce((s, [, c]) => s + c, 0);
    const ranking = sorted.map(([brandId, count], i) => ({
      rank: i + 1,
      brandId,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
    }));

    return NextResponse.json({
      ranking,
      total,
      updatedAt: new Date().toISOString(),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error("ranking error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
