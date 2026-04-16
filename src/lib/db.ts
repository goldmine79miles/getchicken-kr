import { neon } from '@neondatabase/serverless';

export function getDb() {
  return neon(process.env.DATABASE_URL!);
}

/** 유저 게임 상태 테이블 (스마트 발송용) */
export async function initUserState() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS user_state (
      user_key VARCHAR(255) PRIMARY KEY,
      brand_id VARCHAR(50),
      current_capacity REAL DEFAULT 0,
      max_capacity REAL DEFAULT 0.5,
      speed_percent REAL DEFAULT 100,
      last_speed_update BIGINT,
      last_sync_at TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  // 기존 테이블 VARCHAR(100) → 255 마이그레이션
  await sql`ALTER TABLE user_state ALTER COLUMN user_key TYPE VARCHAR(255)`.catch(() => {});
  // notif 컬럼 추가 (기존 테이블 마이그레이션)
  await sql`ALTER TABLE user_state ADD COLUMN IF NOT EXISTS notif_enabled BOOLEAN DEFAULT false`.catch(() => {});
  await sql`ALTER TABLE user_state ADD COLUMN IF NOT EXISTS notif_enabled_at BIGINT`.catch(() => {});
  await sql`CREATE INDEX IF NOT EXISTS idx_user_state_sync ON user_state(last_sync_at)`;
}

/** 푸시 발송 로그 테이블 (중복 방지) */
export async function initPushLog() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS push_log (
      id SERIAL PRIMARY KEY,
      user_key VARCHAR(255) NOT NULL,
      campaign VARCHAR(50) NOT NULL,
      sent_at TIMESTAMP DEFAULT NOW(),
      toss_result TEXT
    )
  `;
  // 기존 테이블 VARCHAR(100) → 255 마이그레이션
  await sql`ALTER TABLE push_log ALTER COLUMN user_key TYPE VARCHAR(255)`.catch(() => {});
  await sql`CREATE INDEX IF NOT EXISTS idx_push_log_lookup ON push_log(user_key, campaign, sent_at)`;
}
