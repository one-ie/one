CREATE TABLE IF NOT EXISTS owners_keys (
  slug TEXT NOT NULL REFERENCES owners(slug) ON DELETE CASCADE,
  pubkey TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT 'device',
  registered_at INTEGER DEFAULT (unixepoch()),
  PRIMARY KEY (slug, pubkey)
);
