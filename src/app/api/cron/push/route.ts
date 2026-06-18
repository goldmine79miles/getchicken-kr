import { NextRequest, NextResponse } from "next/server";
import { getActiveUserStates, getSentAt, markSent, wasSent } from "@/lib/kv";
import { mtlsRequest, TOSS_API } from "@/lib/toss-api";

export const maxDuration = 60;

const CAMPAIGNS = [
  { id: "fullCapacity", templateSetCode: "chicken-fullbox", context: {} },
  { id: "slowSpeed", templateSetCode: "chicken-slowSpeed", context: {} },
] as const;

// chikin cron의 실제 SQL 계수에서 직접 복사 (실측 검증됨)
const BASE_SPEED = 0.000028;
const DAMPENING = 0.85;
const HALF_FULL_THRESHOLD = 0.5; // 보수적 예측 가드 (cap >= max * 0.5 일 때만 예측)
const SPEED_DOWN_GRACE_MS = 7800000;
const ACTIVE_WINDOW_MS = 72 * 3600 * 1000;
const CANDIDATE_LIMIT = 200;
const SEND_LIMIT = 20;
const FULL_CAPACITY_TTL_SEC = 3600;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const certPem = process.env.TOSS_MTLS_CERT;
  const keyPem = process.env.TOSS_MTLS_KEY;
  if (!certPem || !keyPem) {
    return NextResponse.json({ error: "mTLS not configured" }, { status: 500 });
  }

  const now = Date.now();
  const sinceMs = now - ACTIVE_WINDOW_MS;
  const candidates = await getActiveUserStates(sinceMs, now, CANDIDATE_LIMIT);

  const results: Record<string, { eligible: number; sent: number; errors: number }> = {};

  for (const campaign of CAMPAIGNS) {
    const stats = { eligible: 0, sent: 0, errors: 0 };
    const eligible: string[] = [];

    for (const { userKey, state } of candidates) {
      if (!state) continue;
      if (eligible.length >= SEND_LIMIT) break;

      if (campaign.id === "fullCapacity") {
        if (await wasSent("fullCapacity", userKey)) continue;

        const cap = state.currentCapacity ?? 0;
        const max = state.maxCapacity ?? 0;
        if (max <= 0) continue;

        // chikin은 보수적 예측: 절반 이상 차있는 경우에만 elapsed time 기반 예측
        // 부스트 무시, 기본속도 × 0.85로만 계산
        if (cap >= max) {
          eligible.push(userKey);
          continue;
        }

        if (cap >= max * HALF_FULL_THRESHOLD) {
          const lastSyncMs = state.lastSyncAt ?? 0;
          const elapsedSec = (now - lastSyncMs) / 1000;
          const predicted = cap + elapsedSec * BASE_SPEED * DAMPENING;
          if (predicted >= max) {
            eligible.push(userKey);
          }
        }
      } else if (campaign.id === "slowSpeed") {
        const notifAt = state.notifEnabledAt;
        if (!notifAt || notifAt <= 0) continue;
        if (now - notifAt <= SPEED_DOWN_GRACE_MS) continue;

        const sentAt = await getSentAt("slowSpeed", userKey);
        if (sentAt !== null && sentAt > notifAt) continue;

        eligible.push(userKey);
      }
    }

    stats.eligible = eligible.length;

    for (const userKey of eligible) {
      try {
        const result = await mtlsRequest(
          `${TOSS_API}/api-partner/v1/apps-in-toss/messenger/send-message`,
          {
            method: "POST",
            body: JSON.stringify({
              templateSetCode: campaign.templateSetCode,
              context: campaign.context,
            }),
            extraHeaders: { "X-Toss-User-Key": userKey },
            cert: certPem,
            key: keyPem,
          }
        );

        if (result?.resultType === "FAIL") {
          console.error(`[cron/push] ${campaign.id} 발송 실패:`, result.error?.reason);
          stats.errors++;
          continue;
        }

        if (campaign.id === "fullCapacity") {
          await markSent("fullCapacity", userKey, FULL_CAPACITY_TTL_SEC);
        } else {
          await markSent("slowSpeed", userKey);
        }
        stats.sent++;
      } catch (e: unknown) {
        stats.errors++;
        const msg = e instanceof Error ? e.message : "unknown";
        console.error(`[cron/push] ${campaign.id} ${userKey} error:`, msg);
      }
    }

    results[campaign.id] = stats;
  }

  return NextResponse.json({
    ok: true,
    results,
    candidatesScanned: candidates.length,
    checkedAt: new Date().toISOString(),
  });
}
