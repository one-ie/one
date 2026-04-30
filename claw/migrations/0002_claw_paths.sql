-- Cycle 2: Dual-path learning (local D1 + global TypeDB)
-- Claw marks/warns to both layers simultaneously
CREATE TABLE IF NOT EXISTS claw_paths (
  source TEXT NOT NULL,
  target TEXT NOT NULL,
  strength REAL DEFAULT 0.5,
  resistance REAL DEFAULT 0,
  traversals INTEGER DEFAULT 0,
  ts INTEGER,
  PRIMARY KEY (source, target)
);

CREATE INDEX IF NOT EXISTS idx_claw_paths_strength ON claw_paths(strength DESC);
CREATE INDEX IF NOT EXISTS idx_claw_paths_resistance ON claw_paths(resistance DESC);
