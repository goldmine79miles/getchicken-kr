import { neon } from '@neondatabase/serverless';

export function getDb() {
  return neon(process.env.DATABASE_URL!);
}

/** 유저 게임 상태 테이블 (스마트 발송용) */
export async function initUserState() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS user_state (
      user_key VARCHAR(100) PRIMARY KEY,
      brand_id VARCHAR(50),
      current_capacity REAL DEFAULT 0,
      max_capacity REAL DEFAULT 0.5,
      speed_percent REAL DEFAULT 100,
      last_speed_update BIGINT,
      last_sync_at TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_user_state_sync ON user_state(last_sync_at)`;
}
