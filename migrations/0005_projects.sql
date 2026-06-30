-- Project management system: boards, cards, and checklist items.
-- Timestamps are INTEGER milliseconds (Date.now()), matching previous migrations.

CREATE TABLE projects (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  customer_id   INTEGER NOT NULL REFERENCES customers(id),
  status        TEXT NOT NULL DEFAULT 'active',
  password_hash TEXT NOT NULL DEFAULT '',
  start_date    TEXT,
  end_date      TEXT,
  notes         TEXT,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);
CREATE INDEX idx_projects_customer ON projects(customer_id);
CREATE INDEX idx_projects_slug ON projects(slug);

CREATE TABLE project_cards (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  list_key    TEXT NOT NULL DEFAULT 'future',
  position    INTEGER NOT NULL DEFAULT 0,
  person_name TEXT DEFAULT '',
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);
CREATE INDEX idx_cards_project ON project_cards(project_id);
CREATE INDEX idx_cards_list ON project_cards(project_id, list_key);

CREATE TABLE card_checklist_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id     INTEGER NOT NULL REFERENCES project_cards(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  assigned_to TEXT DEFAULT '',
  is_complete INTEGER NOT NULL DEFAULT 0,
  position    INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);
CREATE INDEX idx_checklist_card ON card_checklist_items(card_id);
