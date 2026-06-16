-- CleanAlert Trial & Promo Code Migration
-- Run this in your Neon SQL Editor

-- 1. Add trial column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- 2. Promo codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  trial_days INTEGER NOT NULL DEFAULT 90,
  max_uses INTEGER,             -- NULL = unlimited
  uses_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  note TEXT,                    -- internal label e.g. "Reddit launch batch"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ        -- NULL = never expires
);

-- 3. Seed the first launch code
INSERT INTO promo_codes (code, trial_days, max_uses, note)
VALUES ('CLEAN90', 90, 500, 'Launch invite — 90 day free trial')
ON CONFLICT (code) DO NOTHING;
