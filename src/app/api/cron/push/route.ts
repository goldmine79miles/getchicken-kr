import { NextRequest, NextResponse } from "next/server";
import { getDb, initUserState, initPushLog } from "@/lib/db";
import { mtlsRequest, TOSS_API } from "@/lib/toss-api";

export const maxDuration = 60;

let tablesReady = false;
async function ensureTables() {
  if (!tablesReady) {
    await initUserState();
    await initPushLog();
    tablesReady = true;
  }
}

const CAMPAIGNS = [
  {
    id: "fullCapacity",
    templateSetCode: "chicken-fullbox", // 통 가득참 안내
    context: {},
  },
  {
    id: "slowSpeed",
    templateSetCode: "chicken-slowSpeed", // 속도저하 안내
    context: {},
  },
];

export async function GET(req: NextRequest) {
  // Vercel Cron 인증
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

  await ensureTables();
  const sql = getDb();

  const results: Record<string, { eligible: number; sent: number; errors: number }> = {};

  for (const campaign of CAMPAIGNS) {
    const stats = { eligible: 0, sent: 0, errors: 0 };

    // 조건 매칭 유저 조회 (알림 설정한 유저만)
    // fullCapacity: 튀김통 꽉 참 or 예측 (앱 닫아도 서버에서 계산). 0.000028 = BASE_SPEED, 0.85 = 보수적 계수. 안 비우면 1시간마다 반복
    // slowSpeed: 알림 설정 시점 기준 2시간 10분(7,800,000ms) 후 발송
    const users = campaign.id === "fullCapacity"
      ? await sql`
          SELECT us.user_key FROM user_state us
          WHERE us.current_capacity >= us.max_capacity
            AND us.last_sync_at > NOW() - INTERVAL '72 hours'
            AND NOT EXISTS (
              SELECT 1 FROM push_log pl
              WHERE pl.user_key = us.user_key AND pl.campaign = 'fullCapacity' AND pl.sent_at > NOW() - INTERVAL '1 hour'
            )
        `
      : await sql`
          SELECT us.user_key FROM user_state us
          WHERE us.notif_enabled_at IS NOT NULL
            AND (EXTRACT(EPOCH FROM NOW()) * 1000 - us.notif_enabled_at) > 7800000
            AND us.last_sync_at > NOW() - INTERVAL '72 hours'
            AND NOT EXISTS (
              SELECT 1 FROM push_log pl
              WHERE pl.user_key = us.user_key
                AND pl.campaign = 'slowSpeed'
                AND pl.sent_at > TO_TIMESTAMP(us.notif_enabled_at / 1000.0)
            )
        `;

    stats.eligible = users.length;

    for (const user of users) {
      const userKey = user.user_key;

      // dedup은 위 쿼리의 NOT EXISTS가 담당:
      // - fullCapacity: 최근 1시간 내 미발송 유저만 조회 (꽉 차있으면 1시간마다 반복)
      // - slowSpeed: 현재 notif_enabled_at 이후 미발송 유저만 조회 (재부스트 시 재발송)

      // Toss 메시지 발송 API 호출
      try {
        const result = await mtlsRequest(
          `${TOSS_API}/api-partner/v1/apps-in-toss/messenger/send-message`,
          {
            method: "POST",
            body: JSON.stringify({
              templateSetCode: campaign.templateSetCode,
              context: campaign.context,
            }),
            extraHeaders: {
              "X-Toss-User-Key": userKey,
            },
            cert: certPem,
            key: keyPem,
          }
        );

        if (result?.resultType === "FAIL") {
          console.error(`[cron/push] ${campaign.id} 발송 실패:`, result.error?.reason);
          stats.errors++;
          continue;
        }

        await sql`
          INSERT INTO push_log (user_key, campaign, toss_result)
          VALUES (${userKey}, ${campaign.id}, ${JSON.stringify(result)})
        `;
        stats.sent++;
      } catch (e: any) {
        stats.errors++;
        console.error(`[cron/push] ${campaign.id} ${userKey} error:`, e.message);
      }
    }

    results[campaign.id] = stats;
  }

  return NextResponse.json({
    ok: true,
    results,
    checkedAt: new Date().toISOString(),
  });
}
