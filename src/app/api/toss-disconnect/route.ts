import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";

/**
 * 토스 연결 끊기 콜백
 * - 토스 개발자 콘솔에서 설정한 URL로 회원 탈퇴 시 호출됨
 * - Basic Auth 헤더로 인증
 */

const DISCONNECT_SECRET = process.env.TOSS_DISCONNECT_SECRET || "";

const ALLOWED_ORIGINS = [
  "https://chikin.apps.tossmini.com",
  "https://chikin.private-apps.tossmini.com",
];

function getCorsHeaders(origin?: string | null) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
  };
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(origin) });
}

function verifyBasicAuth(req: NextRequest): boolean {
  if (!DISCONNECT_SECRET) {
    console.warn("[toss-disconnect] TOSS_DISCONNECT_SECRET 미설정 — 인증 스킵");
    return true;
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Basic ")) return false;

  const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf8");
  const expected = DISCONNECT_SECRET;
  if (decoded.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(decoded), Buffer.from(expected));
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin");
  const cors = getCorsHeaders(origin);
  const ip = getClientIP(req);
  const rl = checkRateLimit(`toss-disconnect:${ip}`, { limit: 10, windowSec: 60 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { ...cors, "Retry-After": String(rl.resetIn) } }
    );
  }

  if (!verifyBasicAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: cors });
  }

  const url = new URL(req.url);
  const userKey = url.searchParams.get("userKey");

  try {
    if (userKey) {
      console.log(`[toss-disconnect] User disconnected: ${userKey}`);
    } else {
      console.log("[toss-disconnect] Test ping received (no userKey)");
    }
    return NextResponse.json({ resultType: "SUCCESS" }, { headers: cors });
  } catch (error) {
    console.error("[toss-disconnect] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: cors });
  }
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  const cors = getCorsHeaders(origin);
  const ip = getClientIP(req);
  const rl = checkRateLimit(`toss-disconnect:${ip}`, { limit: 10, windowSec: 60 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { ...cors, "Retry-After": String(rl.resetIn) } }
    );
  }

  if (!verifyBasicAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: cors });
  }

  try {
    let userKey: string | undefined;
    try {
      const body = await req.json();
      userKey = body.userKey;
    } catch {}

    if (userKey) {
      console.log(`[toss-disconnect] User disconnected: ${userKey}`);
    } else {
      console.log("[toss-disconnect] Test ping received (no userKey)");
    }
    return NextResponse.json({ resultType: "SUCCESS" }, { headers: cors });
  } catch (error) {
    console.error("[toss-disconnect] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: cors });
  }
}
