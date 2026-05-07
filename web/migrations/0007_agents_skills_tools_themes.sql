-- Migration 0007: agents, skills, tools, themes
-- Tables: agents, agent_skills, tool_connections, themes, agent_generations

CREATE TABLE agents (
  id           TEXT PRIMARY KEY,
  owner_id     TEXT NOT NULL,
  slug         TEXT NOT NULL,
  name         TEXT NOT NULL,
  frontmatter  TEXT NOT NULL,
  body         TEXT NOT NULL,
  state        TEXT NOT NULL DEFAULT 'draft',
  generation   INTEGER NOT NULL DEFAULT 1,
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL,
  UNIQUE(owner_id, slug)
);

CREATE TABLE agent_skills (
  agent_id   TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  PRIMARY KEY (agent_id, skill_name)
);

CREATE TABLE tool_connections (
  id           TEXT PRIMARY KEY,
  owner_id     TEXT NOT NULL,
  provider     TEXT NOT NULL,
  account      TEXT NOT NULL,
  scopes       TEXT NOT NULL,
  refresh_at   INTEGER,
  created_at   INTEGER NOT NULL
);

CREATE TABLE themes (
  id          TEXT PRIMARY KEY,
  owner_id    TEXT,
  name        TEXT NOT NULL,
  tokens      TEXT NOT NULL,
  is_public   INTEGER NOT NULL DEFAULT 0,
  fork_of     TEXT,
  created_at  INTEGER NOT NULL
);

CREATE TABLE agent_generations (
  id           TEXT PRIMARY KEY,
  agent_id     TEXT NOT NULL,
  generation   INTEGER NOT NULL,
  frontmatter  TEXT NOT NULL,
  body         TEXT NOT NULL,
  reason       TEXT,
  created_at   INTEGER NOT NULL
);
