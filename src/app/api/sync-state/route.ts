import { NextRequest, NextResponse } from "next/server";
import { setUser, getActiveUserStates } from "@/lib/kv";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";

const SYNC_API_KEY = process.env.SYNC_API_KEY || "";

function verifyApiKey(req: NextRequest): boolean {
  if (!SYNC_API_KEY) return false;
  const key = req.headers.get("x-api-key");
  return key === SYNC_API_KEY;
}

function isValidNumber(v: unknown, min: number, max: number): boolean {
  return typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
}

/** 토스 앱에서 게임 상태 동기화 (기능성 스마트 발송용) */
export async function POST(req: NextRequest) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIP(req);
  const rl = checkRateLimit(`sync-state:${ip}`, { limit: 60, windowSec: 60 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(rl.resetIn) } });
  }

  try {
    const { userKey, brandId, currentCapacity, maxCapacity, speedPercent, lastSpeedUpdate, notifEnabledAt } = await req.json();

    if (!userKey || typeof userKey !== "string" || userKey.length > 255) {
      return NextResponse.json({ error: "invalid userKey" }, { status: 400 });
    }
    // authorizationCode(128자 이상) 및 dev/test 값 차단
    if (
      userKey.length > 100 ||
      userKey.startsWith("dev_") ||
      userKey.startsWith("test") ||
      /[^A-Za-z0-9_-]/.test(userKey)
    ) {
      return NextResponse.json({ error: "invalid userKey format" }, { status: 400 });
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

    await setUser(userKey, {
      brandId,
      currentCapacity,
      maxCapacity,
      speedPercent,
      lastSpeedUpdate,
      notifEnabledAt,
    });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error("sync-state error:", msg);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** 스마트 발송 cron에서 조건 체크용 */
export async function GET(req: NextRequest) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = Date.now();
    const sinceMs = now - 24 * 3600 * 1000;
    const entries = await getActiveUserStates(sinceMs, now);

    const fullCapacity = [];
    const slowSpeed = [];
    for (const { userKey, state } of entries) {
      if (!state) continue;
      const cap = state.currentCapacity ?? 0;
      const max = state.maxCapacity ?? 0;
      const speed = state.speedPercent ?? 100;
      if (max > 0 && cap >= max) {
        fullCapacity.push({ user_key: userKey, brand_id: state.brandId, current_capacity: cap, max_capacity: max });
      }
      if (speed <= 100) {
        slowSpeed.push({ user_key: userKey, brand_id: state.brandId, speed_percent: speed });
      }
    }

    return NextResponse.json({
      fullCapacity,
      slowSpeed,
      checkedAt: new Date().toISOString(),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error("sync-state GET error:", msg);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
