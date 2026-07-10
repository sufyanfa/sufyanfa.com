-- Split-payment installment plans for invoices.
-- Every invoice (old and new) has >=1 installment row, so status-derivation
-- logic never has to special-case "no installments". Amounts stored as
-- halalas, snapshotted at plan-save time (see server/utils/installments.ts).

CREATE TABLE invoice_installments (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id   INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  position     INTEGER NOT NULL,
  label        TEXT NOT NULL,
  percentage   INTEGER,
  amount       INTEGER NOT NULL,
  due_date     TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending',
  paid_at      INTEGER,
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL
);
CREATE INDEX idx_installments_invoice ON invoice_installments(invoice_id);

-- Backfill: every existing invoice gets one implicit 100% installment
-- mirroring its current status.
INSERT INTO invoice_installments
  (invoice_id, position, label, percentage, amount, due_date, status, paid_at, created_at, updated_at)
SELECT
  i.id, 0, 'الدفعة الكاملة', 100,
  COALESCE((SELECT SUM(amount) FROM invoice_items WHERE invoice_id = i.id), 0) + i.adjustment,
  i.due_date,
  CASE WHEN i.status = 'paid' THEN 'paid' ELSE 'pending' END,
  i.paid_at,
  i.created_at,
  i.updated_at
FROM invoices i;
