-- Proposal system initial schema

CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_admin      INTEGER NOT NULL DEFAULT 0,
  created_at    INTEGER NOT NULL
);

CREATE TABLE proposals (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  client_name     TEXT NOT NULL,
  client_label    TEXT,
  proposal_date   TEXT NOT NULL,
  password_hash   TEXT NOT NULL,
  content_md      TEXT NOT NULL,
  cta_label       TEXT,
  cta_url         TEXT,
  status          TEXT NOT NULL DEFAULT 'draft',
  expires_at      INTEGER,
  accepted_at     INTEGER,
  declined_at     INTEGER,
  decline_note    TEXT,
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);

CREATE INDEX idx_proposals_slug ON proposals(slug);
CREATE INDEX idx_proposals_status ON proposals(status);

CREATE TABLE proposal_views (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  proposal_id INTEGER NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  viewed_at   INTEGER NOT NULL,
  ip_hash     TEXT,
  user_agent  TEXT
);

CREATE INDEX idx_views_proposal ON proposal_views(proposal_id);

CREATE TABLE login_attempts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  scope       TEXT NOT NULL,
  key         TEXT NOT NULL,
  attempted_at INTEGER NOT NULL
);

CREATE INDEX idx_login_attempts_scope_key ON login_attempts(scope, key, attempted_at);
