import { NextRequest, NextResponse } from "next/server";
import { getDb, initUserState } from "@/lib/db";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";

let initialized = false;

async function ensureTable() {
  if (!initialized) {
    await initUserState();
    initialized = true;
  }
}

const SYNC_API_KEY = process.env.SYNC_API_KEY || "";

function verifyApiKey(req: NextRequest): boolean {
  if (!SYNC_API_KEY) return false; // 미설정이면 차단
  const key = req.headers.get("x-api-key");
  return key === SYNC_API_KEY;
}

function isValidNumber(v: unknown, min: number, max: number): boolean {
  return typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
}

/** 토스 앱에서 게임 상태 동기화 (기능성 스마트 발송용) */
export async function POST(req: NextRequest) {
  // 인증
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 레이트리밋: IP당 60req/분
  const ip = getClientIP(req);
  const rl = checkRateLimit(`sync-state:${ip}`, { limit: 60, windowSec: 60 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(rl.resetIn) } });
  }

  try {
    const { userKey, brandId, currentCapacity, maxCapacity, speedPercent, lastSpeedUpdate } = await req.json();

    if (!userKey || typeof userKey !== "string" || userKey.length > 255) {
      return NextResponse.json({ error: "invalid userKey" }, { status: 400 });
    }
    if (brandId !== undefined && (typeof brandId !== "string" || brandId.length > 50)) {
      return NextResponse.json({ error: "invalid brandId" }, { status: 400 });
    }
    if (currentCapacity !== undefined && !isValidNumber(currentCapacity, 0, 100000)) {
      return NextResponse.json({ error: "invalid currentCapacity" }, { status: 400 });
    }
    if (maxCapacity !== undefined && !isValidNumber(maxCapacity, 0, 100000)) {
      return NextResponse.json({ error: "invalid maxCapacity" }, { status: 400 });
    }
    if (speedPercent !== undefined && !isValidNumber(speedPercent, 0, 100000)) {
      return NextResponse.json({ error: "invalid speedPercent" }, { status: 400 });
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** 스마트 발송 cron에서 조건 체크용 */
export async function GET(req: NextRequest) {
  // 인증
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureTable();
    const sql = getDb();

    const fullCapacity = await sql`
      SELECT user_key, brand_id, current_capacity, max_capacity
      FROM user_state
      WHERE current_capacity >= max_capacity
        AND last_sync_at > NOW() - INTERVAL '24 hours'
    `;

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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
