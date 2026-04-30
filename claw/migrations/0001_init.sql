-- NanoClaw D1 Schema
-- Groups, Messages, Sessions, Tasks

-- Groups (per-channel isolation)
CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  channel TEXT NOT NULL,
  name TEXT,
  system_prompt TEXT,
  model TEXT DEFAULT 'google/gemma-4-26b-a4b-it',
  sensitivity REAL DEFAULT 0.5,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Messages (conversation history)
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  sender TEXT NOT NULL,
  content TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  ts INTEGER NOT NULL,
  FOREIGN KEY (group_id) REFERENCES groups(id)
);

CREATE INDEX IF NOT EXISTS idx_messages_group ON messages(group_id, ts);

-- Sessions (active conversations, compressed context)
CREATE TABLE IF NOT EXISTS sessions (
  group_id TEXT PRIMARY KEY,
  last_message_id TEXT,
  context_window TEXT,
  updated_at INTEGER,
  FOREIGN KEY (group_id) REFERENCES groups(id)
);

-- Scheduled tasks
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  cron TEXT NOT NULL,
  prompt TEXT NOT NULL,
  next_run INTEGER,
  enabled INTEGER DEFAULT 1,
  FOREIGN KEY (group_id) REFERENCES groups(id)
);

CREATE INDEX IF NOT EXISTS idx_tasks_next ON tasks(next_run) WHERE enabled = 1;

-- Tool call history
CREATE TABLE IF NOT EXISTS tool_calls (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  message_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  input TEXT,
  output TEXT,
  ts INTEGER NOT NULL,
  FOREIGN KEY (group_id) REFERENCES groups(id)
);

CREATE INDEX IF NOT EXISTS idx_tool_calls_group ON tool_calls(group_id, ts);
