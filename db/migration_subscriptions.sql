-- CleanAlert: Subscription Controls + User Notifications

-- Scheduled activation date (admin sets this; auto-activates on next login)
ALTER TABLE users ADD COLUMN IF NOT EXISTS scheduled_activation_date TIMESTAMPTZ;

-- In-app notification feed for buyers and cleaners
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON user_notifications(user_id, is_read, created_at DESC);
