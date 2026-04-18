import { NextResponse } from "next/server";
import { getDb, initUserState } from "@/lib/db";

let initialized = false;

async function ensureTable() {
  if (!initialized) {
    await initUserState();
    initialized = true;
  }
}

/** 브랜드별 실시간 인기 랭킹 (최근 24시간 활성 유저 기준) */
export async function GET() {
  try {
    await ensureTable();
    const sql = getDb();

    const rows = await sql`
      SELECT brand_id, COUNT(*) as cnt
      FROM user_state
      WHERE last_sync_at > NOW() - INTERVAL '24 hours'
        AND brand_id IS NOT NULL
      GROUP BY brand_id
      ORDER BY cnt DESC
    `;

    const total = rows.reduce((s, r) => s + Number(r.cnt), 0);

    const ranking = rows.map((r, i) => ({
      rank: i + 1,
      brandId: r.brand_id,
      count: Number(r.cnt),
      percent: total > 0 ? Math.round((Number(r.cnt) / total) * 100) : 0,
    }));

    return NextResponse.json({
      ranking,
      total,
      updatedAt: new Date().toISOString(),
    });
  } catch (e: any) {
    console.error("ranking error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
