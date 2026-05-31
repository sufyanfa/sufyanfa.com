-- Invoices system: customers, invoices, line items, single-row settings.
-- Timestamps are INTEGER milliseconds (Date.now()), matching 0001_initial.sql.

CREATE TABLE customers (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  email        TEXT,
  phone        TEXT,
  company      TEXT,
  notes        TEXT,
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL
);
CREATE INDEX idx_customers_name ON customers(name);

CREATE TABLE invoices (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  slug              TEXT NOT NULL UNIQUE,
  number            TEXT NOT NULL UNIQUE,
  customer_id       INTEGER NOT NULL REFERENCES customers(id),
  status            TEXT NOT NULL DEFAULT 'draft',
  issue_date        TEXT NOT NULL,
  due_date          TEXT NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'SAR',
  adjustment        INTEGER NOT NULL DEFAULT 0,
  adjustment_label  TEXT,
  notes             TEXT,
  paid_at           INTEGER,
  sent_at           INTEGER,
  created_at        INTEGER NOT NULL,
  updated_at        INTEGER NOT NULL
);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status   ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

CREATE TABLE invoice_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id   INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  position     INTEGER NOT NULL,
  description  TEXT NOT NULL,
  amount       INTEGER NOT NULL
);
CREATE INDEX idx_items_invoice ON invoice_items(invoice_id);

CREATE TABLE settings (
  id                  INTEGER PRIMARY KEY CHECK (id = 1),
  business_name       TEXT NOT NULL,
  logo_url            TEXT,
  email               TEXT,
  phone               TEXT,
  address             TEXT,
  bank_name           TEXT,
  bank_account_name   TEXT,
  bank_account_number TEXT,
  bank_iban           TEXT,
  default_due_days    INTEGER NOT NULL DEFAULT 14,
  default_notes       TEXT,
  updated_at          INTEGER NOT NULL
);

-- Seed the single settings row so the admin UI never sees an empty state.
INSERT INTO settings (id, business_name, logo_url, default_due_days, updated_at)
VALUES (1, 'سفيان فارع', '/logo.svg', 14, 0);
