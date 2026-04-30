-- Claw owner notifications
-- Owners register to receive alerts when students message their claw

CREATE TABLE IF NOT EXISTS claw_owners (
  claw_id TEXT PRIMARY KEY,           -- worker/persona identifier (e.g. 'debby')
  owner_channel TEXT NOT NULL,         -- telegram, discord, web
  owner_group_id TEXT NOT NULL,        -- the group_id to send alerts to (e.g. 'tg-123456')
  alert_level TEXT DEFAULT 'all',      -- off, first, low-confidence, all
  created_at INTEGER DEFAULT (unixepoch())
);
