import { NextRequest, NextResponse } from "next/server";
import { getDb, initUserState } from "@/lib/db";

let initialized = false;

async function ensureTable() {
  if (!initialized) {
    await initUserState();
    initialized = true;
  }
}

/** 토스 앱에서 게임 상태 동기화 (기능성 스마트 발송용) */
export async function POST(req: NextRequest) {
  try {
    const { userKey, brandId, currentCapacity, maxCapacity, speedPercent, lastSpeedUpdate } = await req.json();

    if (!userKey) {
      return NextResponse.json({ error: "userKey required" }, { status: 400 });
    }

    await ensureTable();
    const sql = getDb();

    await sql`
      INSERT INTO user_state (user_key, brand_id, current_capacity, max_capacity, speed_percent, last_speed_update, last_sync_at)
      VALUES (${userKey}, ${brandId}, ${currentCapacity}, ${maxCapacity}, ${speedPercent}, ${lastSpeedUpdate}, NOW())
      ON CONFLICT (user_key) DO UPDATE SET
        brand_id = ${brandId},
        current_capacity = ${currentCapacity},
        max_capacity = ${maxCapacity},
        speed_percent = ${speedPercent},
        last_speed_update = ${lastSpeedUpdate},
        last_sync_at = NOW()
    `;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("sync-state error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/** 스마트 발송 cron에서 조건 체크용 */
export async function GET() {
  try {
    await ensureTable();
    const sql = getDb();

    // 튀김통 가득 찬 유저 (capacity >= maxCapacity)
    const fullCapacity = await sql`
      SELECT user_key, brand_id, current_capacity, max_capacity
      FROM user_state
      WHERE current_capacity >= max_capacity
        AND last_sync_at > NOW() - INTERVAL '24 hours'
    `;

    // 속도 감소한 유저 (speedPercent <= 100 이하로 내려간 유저)
    const slowSpeed = await sql`
      SELECT user_key, brand_id, speed_percent
      FROM user_state
      WHERE speed_percent <= 100
        AND last_sync_at > NOW() - INTERVAL '24 hours'
    `;

    return NextResponse.json({
      fullCapacity,
      slowSpeed,
      checkedAt: new Date().toISOString(),
    });
  } catch (e: any) {
    console.error("sync-state GET error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
