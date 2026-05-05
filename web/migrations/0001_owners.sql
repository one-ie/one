CREATE TABLE IF NOT EXISTS owners (
  slug TEXT PRIMARY KEY,
  pubkey TEXT NOT NULL,
  credential_id TEXT NOT NULL,
  ts INTEGER NOT NULL DEFAULT (unixepoch())
);
