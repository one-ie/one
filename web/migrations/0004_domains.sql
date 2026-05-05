CREATE TABLE IF NOT EXISTS domains (
  host TEXT PRIMARY KEY,
  slug TEXT NOT NULL REFERENCES owners(slug) ON DELETE CASCADE,
  verified INTEGER NOT NULL DEFAULT 0,
  verify_token TEXT,
  ts INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_domains_slug ON domains(slug);
