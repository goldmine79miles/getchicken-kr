import { Redis } from "@upstash/redis";

export const kv = new Redis({
  url: process.env.KV_REST_API_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
});

const PREFIX = "chicken";

export const K = {
  user: (userKey: string) => `${PREFIX}:u:${userKey}`,
  active: () => `${PREFIX}:active`,
  sent: (campaign: string, userKey: string) => `${PREFIX}:sent:${campaign}:${userKey}`,
};

export interface UserState {
  brandId?: string;
  currentCapacity?: number;
  maxCapacity?: number;
  speedPercent?: number;
  lastSpeedUpdate?: number;
  notifEnabledAt?: number;
  lastSyncAt?: number;
}

function parseUser(data: Record<string, unknown> | null): UserState | null {
  if (!data || Object.keys(data).length === 0) return null;
  const num = (v: unknown): number | undefined =>
    v === undefined || v === null || v === "" ? undefined : Number(v);
  return {
    brandId: data.brandId ? String(data.brandId) : undefined,
    currentCapacity: num(data.currentCapacity),
    maxCapacity: num(data.maxCapacity),
    speedPercent: num(data.speedPercent),
    lastSpeedUpdate: num(data.lastSpeedUpdate),
    notifEnabledAt: num(data.notifEnabledAt),
    lastSyncAt: num(data.lastSyncAt),
  };
}

export async function getUser(userKey: string): Promise<UserState | null> {
  const data = await kv.hgetall<Record<string, unknown>>(K.user(userKey));
  return parseUser(data);
}

export async function setUser(userKey: string, partial: Partial<UserState>): Promise<void> {
  const now = Date.now();
  const fields: Record<string, string | number> = { lastSyncAt: now };
  if (partial.brandId !== undefined && partial.brandId !== null) fields.brandId = partial.brandId;
  if (partial.currentCapacity !== undefined && partial.currentCapacity !== null) fields.currentCapacity = partial.currentCapacity;
  if (partial.maxCapacity !== undefined && partial.maxCapacity !== null) fields.maxCapacity = partial.maxCapacity;
  if (partial.speedPercent !== undefined && partial.speedPercent !== null) fields.speedPercent = partial.speedPercent;
  if (partial.lastSpeedUpdate !== undefined && partial.lastSpeedUpdate !== null) fields.lastSpeedUpdate = partial.lastSpeedUpdate;
  if (partial.notifEnabledAt !== undefined && partial.notifEnabledAt !== null && partial.notifEnabledAt > 0) {
    fields.notifEnabledAt = partial.notifEnabledAt;
  }

  const p = kv.pipeline();
  p.hset(K.user(userKey), fields);
  p.zadd(K.active(), { score: Math.floor(now / 1000), member: userKey });
  await p.exec();
}

export async function deleteUser(userKey: string): Promise<void> {
  const p = kv.pipeline();
  p.del(K.user(userKey));
  p.zrem(K.active(), userKey);
  p.del(K.sent("fullCapacity", userKey));
  p.del(K.sent("slowSpeed", userKey));
  await p.exec();
}

export async function listActiveUsers(sinceMs: number, untilMs: number, limit?: number): Promise<string[]> {
  const sinceSec = Math.floor(sinceMs / 1000);
  const untilSec = Math.floor(untilMs / 1000);
  const result = limit !== undefined
    ? await kv.zrange(K.active(), sinceSec, untilSec, { byScore: true, offset: 0, count: limit })
    : await kv.zrange(K.active(), sinceSec, untilSec, { byScore: true });
  return result as string[];
}

export async function getActiveUserStates(sinceMs: number, untilMs: number, limit?: number): Promise<Array<{ userKey: string; state: UserState | null }>> {
  const users = await listActiveUsers(sinceMs, untilMs, limit);
  if (users.length === 0) return [];
  const p = kv.pipeline();
  for (const u of users) p.hgetall(K.user(u));
  const results = (await p.exec()) as Array<Record<string, unknown> | null>;
  return users.map((userKey, i) => ({ userKey, state: parseUser(results[i]) }));
}

export async function getActiveBrandCounts(sinceMs: number, untilMs: number): Promise<Record<string, number>> {
  const users = await listActiveUsers(sinceMs, untilMs);
  if (users.length === 0) return {};
  const p = kv.pipeline();
  for (const u of users) p.hget(K.user(u), "brandId");
  const results = (await p.exec()) as Array<string | null>;
  const counts: Record<string, number> = {};
  for (const brandId of results) {
    if (brandId && typeof brandId === "string") {
      counts[brandId] = (counts[brandId] ?? 0) + 1;
    }
  }
  return counts;
}

export async function markSent(campaign: string, userKey: string, ttlSec?: number): Promise<void> {
  const now = Date.now();
  if (ttlSec && ttlSec > 0) {
    await kv.set(K.sent(campaign, userKey), now, { ex: ttlSec });
  } else {
    await kv.set(K.sent(campaign, userKey), now);
  }
}

export async function wasSent(campaign: string, userKey: string): Promise<boolean> {
  const v = await kv.get(K.sent(campaign, userKey));
  return v !== null;
}

export async function getSentAt(campaign: string, userKey: string): Promise<number | null> {
  const v = await kv.get<number | string>(K.sent(campaign, userKey));
  if (v === null || v === undefined) return null;
  return typeof v === "number" ? v : Number(v);
}
