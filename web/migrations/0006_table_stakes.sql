CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  slug TEXT NOT NULL,
  kind TEXT NOT NULL,
  payload TEXT,
  ts INTEGER NOT NULL DEFAULT (unixepoch()),
  read INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  host TEXT,
  path TEXT,
  kind TEXT,
  body TEXT,
  ts INTEGER NOT NULL DEFAULT (unixepoch()),
  status TEXT NOT NULL DEFAULT 'open'
);
