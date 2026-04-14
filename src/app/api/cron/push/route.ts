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
    condition: "current_capacity >= max_capacity",
    templateSetCode: "REPLACE_AFTER_APPROVAL", // 승인 후 교체
    context: {},
  },
  {
    id: "slowSpeed",
    condition: "speed_percent <= 100",
    templateSetCode: "REPLACE_AFTER_APPROVAL", // 승인 후 교체
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

    // 조건 매칭 유저 조회
    const users = campaign.id === "fullCapacity"
      ? await sql`SELECT user_key FROM user_state WHERE current_capacity >= max_capacity AND last_sync_at > NOW() - INTERVAL '24 hours'`
      : await sql`SELECT user_key FROM user_state WHERE speed_percent <= 100 AND last_sync_at > NOW() - INTERVAL '24 hours'`;

    stats.eligible = users.length;

    for (const user of users) {
      const userKey = user.user_key;

      // 오늘 이미 보냈는지 체크
      const existing = await sql`
        SELECT 1 FROM push_log
        WHERE user_key = ${userKey}
          AND campaign = ${campaign.id}
          AND sent_at::date = CURRENT_DATE
        LIMIT 1
      `;
      if (existing.length > 0) continue;

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
