# Invoice Installments & Status Dashboard — Design Spec

**Date:** 2026-07-10
**Status:** Approved (pending user spec review)
**Author:** Sufyan Farea + Claude
**Related:** [Invoice & billing system spec](2026-05-17-invoice-billing-design.md) — this extends that system, does not replace it

---

## Goal

Extend the existing invoice system (`migrations/0002_invoices.sql`, `server/api/admin/invoices/*`, `pages/admin/invoices/*`) so an invoice can be collected in more than one payment (e.g. 40% deposit, 60% on completion), each tranche tracked with its own due date and paid/pending state. Also add a stats view so the admin can see, at a glance, how many invoices are in each state and how much money is outstanding vs collected — the "PM view" of billing health.

## Non-goals (this pass)

- No changes to the proposal system's `price`/`price_after_discount` columns — installments apply to invoices only.
- No auto-recalculation of installment amounts if invoice items are edited after the payment plan is saved (amounts are a snapshot, same convention as `adjustment`).
- No partial-amount payments within a single installment (an installment is atomic: pending or paid, not "60% of this installment paid").
- No payment gateway / online payment collection — this only *tracks* which tranche was paid, recorded manually by the admin (matches how `mark-paid` already works today).
- No changes to WhatsApp reminder templates in this pass (follow-up if needed).

## Decisions (confirmed with user)

| Topic | Decision |
| --- | --- |
| Split definition | Predefined installment plan (label + percentage + own due date), not a running/free-form ledger |
| New invoice states | `partially_paid` added alongside existing `draft`/`sent`/`paid` |
| Existing invoices | Backfilled with one implicit 100% installment each, so status logic never special-cases "no installments" |
| Split scope | Invoices only, not proposals |
| Public page | `/i/[slug]` shows the installment schedule (label, amount, due date, paid/pending) when there's more than one installment |
| Stats dashboard | A stats bar added above the existing filters on `/admin/invoices` (not a new page) |

---

## Architecture overview

Purely additive to the existing invoice system — same D1 binding (`DB`), same admin JWT auth, same file layout conventions.

- **Storage:** new table `invoice_installments`, FK to `invoices`
- **Status:** `invoices.status` becomes a value *derived from* installment state whenever a payment is recorded, rather than toggled directly (except `draft`→`sent`, which is unchanged)
- **No new modules, no new bindings**

---

## Data model

New migration `migrations/0007_invoice_installments.sql`:

```sql
CREATE TABLE invoice_installments (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id   INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  position     INTEGER NOT NULL,
  label        TEXT NOT NULL,        -- e.g. 'دفعة مقدمة', 'الدفعة النهائية'
  percentage   INTEGER,              -- 0-100, informational; nullable if amount entered directly
  amount       INTEGER NOT NULL,     -- halalas, snapshotted at plan-save time
  due_date     TEXT NOT NULL,        -- ISO 'YYYY-MM-DD', own due date per installment
  status       TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'paid'
  paid_at      INTEGER,
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL
);
CREATE INDEX idx_installments_invoice ON invoice_installments(invoice_id);

-- Backfill: every existing invoice gets one implicit 100% installment.
INSERT INTO invoice_installments
  (invoice_id, position, label, percentage, amount, due_date, status, paid_at, created_at, updated_at)
SELECT
  i.id, 0, 'الدفعة الكاملة', 100,
  COALESCE((SELECT SUM(amount) FROM invoice_items WHERE invoice_id = i.id), 0) + i.adjustment,
  i.due_date,
  CASE WHEN i.status = 'paid' THEN 'paid' ELSE 'pending' END,
  i.paid_at, i.updated_at, i.updated_at
FROM invoices i;
```

No schema change to `invoices.status` itself (still `TEXT`) — application code adds `partially_paid` as a valid value alongside `draft`/`sent`/`paid`.

### Status derivation

Recomputed and written to `invoices.status`/`paid_at` any time an installment's paid state changes:

- `draft` — untouched by installment payments (existing guard: can't pay a draft, unchanged)
- 0 of N installments paid → `sent`
- 1..N-1 of N paid → `partially_paid`
- N of N paid → `paid`, `paid_at` = latest installment `paid_at`

### Money handling

Same convention as the rest of the invoice system: integer halalas, snapshotted. When a plan is defined by percentage, `amount` is computed from the invoice total (`SUM(items.amount) + adjustment`) at the moment the plan is saved and stored as a fixed value — it does not recompute if items are edited afterward (matches how `adjustment` already behaves; documented limitation, not a bug).

---

## API changes

```
POST   /api/admin/invoices                                   create — body gains optional `installments[]`
PUT    /api/admin/invoices/[id]                               update — body gains optional `installments[]`
GET    /api/admin/invoices/[id]                               response gains `installments: [...]`
POST   /api/admin/invoices/[id]/mark-paid                     repurposed: settles ALL remaining unpaid installments
POST   /api/admin/invoices/[id]/installments/[iid]/mark-paid  new: settles ONE installment, recomputes invoice.status
GET    /api/admin/invoices                                    list response gains `stats` block (see below)
```

### `installments[]` request shape

```ts
{ label: string; percentage?: number; amount?: number; due_date: string }[]
```

Validation: if omitted entirely, server defaults to a single row (`label: 'الدفعة الكاملة'`, `percentage: 100`, `due_date: body.due_date`). If provided, either all rows carry `percentage` (must sum to exactly 100) or all rows carry `amount` directly (must sum to exactly the invoice total) — no mixing. `due_date` per row must be `>= issue_date`.

### List endpoint `stats` block

```ts
{
  counts: { draft: number; sent: number; partially_paid: number; paid: number; overdue: number }
  totals: { invoiced: number; collected: number; outstanding: number } // halalas
}
```

`overdue` = count of non-draft, non-fully-paid invoices with any pending installment whose `due_date < today`. Computed server-side so the list page doesn't do N+1 client math (today's `outstanding`/`overdue` computed-in-`<script>` logic moves into this endpoint).

---

## Admin UI changes

### `components/Admin/InvoiceForm.vue`

New "خطة الدفع" section, collapsed by default (single 100% installment, invisible to the admin unless they opt in):

- Toggle: "دفعة واحدة" (default) / "تقسيم لدفعات"
- When split: repeatable rows of `{ label, percentage, due_date }` with a live "المتبقي: N%" indicator; add/remove row buttons; blocks submit until percentages sum to 100

### `pages/admin/invoices/[id].vue`

- Single-installment invoice: unchanged — the existing "وضع كمدفوعة" button remains a one-click full settlement.
- Split invoice: installment list replacing that button — each row shows label / amount / due date / status with a "تسجيل كمدفوعة" action on pending rows, plus a "تسجيل الكل كمدفوع" shortcut equivalent to today's single button.

### `pages/admin/invoices/index.vue`

Stats bar inserted above the existing filter chips: tiles for مسودة / مرسلة / مدفوعة جزئياً / مكتملة / متأخرة (counts), plus an "المحصّل / المتبقي" totals pair, sourced from the list endpoint's new `stats` block. Filter chips gain `partially_paid` as a fifth option (الكل / مسودة / مرسلة / مدفوعة جزئياً / مكتملة). `badgeClass`/`badgeText` in that page gain a case for `partially_paid` (amber, "مدفوعة جزئياً").

---

## Public viewer `pages/i/[slug].vue`

When an invoice has more than one installment, render a schedule table under the totals block:

```
الإجمالي                                    12,000.00 ر.س
──────────────────────────────────────────────────────
✓ دفعة مقدمة (40%)      4,800.00 ر.س   دُفعت 2026-06-01
○ الدفعة النهائية (60%) 7,200.00 ر.س   تستحق 2026-07-15
```

Single-installment invoices render exactly as they do today — no schedule clutter for the common case. A pending installment past its `due_date` gets the same red overdue treatment already used for the invoice-level badge.

---

## Edge cases

| Case | Handling |
| --- | --- |
| Legacy invoices (pre-migration) | Backfilled with one implicit 100% installment; behave identically to a freshly created single-installment invoice |
| Items edited after plan saved | Installment amounts do not auto-adjust (documented limitation); admin must re-save the plan if the total changes materially |
| Marking an installment paid on a `draft` invoice | Rejected — same 409 guard as today's `mark-paid` |
| Deleting an invoice | Cascades to `invoice_installments` same as `invoice_items` (`ON DELETE CASCADE`) |
| Duplicate ("تكرار للشهر القادم") | Clones the installment plan too (same percentages/labels, due dates shifted the same way item dates are today — via `settings.default_due_days` from the new issue date) |
| Percentages not summing to 100 | 400 rejected server-side, not just client-validated |
| Overdue computation | Based on installment-level `due_date`, not the invoice-level `due_date` (which becomes informational once a plan is split) |

---

## Testing & verification

No new test framework — verification via the codified deploy preflight in `CLAUDE.md`.

### Local verification (before commit)

1. `npx wrangler d1 migrations apply sufyanfa-proposals --local`
2. `yarn dev` (port 3002) — full flow: create invoice with a 40/60 split → mark sent → open `/i/<slug>` in incognito, confirm schedule renders → mark first installment paid → confirm invoice list shows "مدفوعة جزئياً" and stats bar updates → mark second installment paid → confirm invoice flips to "مكتملة" → verify a plain (non-split) invoice still one-click "وضع كمدفوعة" as before
3. After commit, apply to remote: `npx wrangler d1 migrations apply sufyanfa-proposals --remote`

### Pre-deploy (full preflight per `CLAUDE.md`)

Same 7-step sequence as always — clean build, verify no vite-node leak, `wrangler pages dev` smoke test (`/admin/invoices`, `/i/<slug>` → 200), deploy, verify preview URL, verify prod alias.

---

## Scope guardrails

Not in this pass (follow-up specs if/when needed):

- Partial payment *within* a single installment (e.g. "paid 2,000 of the 4,800 deposit")
- Auto-recalculating installment amounts when invoice items change post-plan
- Applying installment plans to proposals
- Payment gateway integration
- WhatsApp reminder template changes for per-installment reminders

---

## Implementation order (for the plan to follow)

1. Migration `0007_invoice_installments.sql` (create table + backfill) + apply locally
2. Server: extend `index.post.ts` / `[id].put.ts` to accept and validate `installments[]`; extend `[id].get.ts` to return them
3. Server: new `installments/[iid]/mark-paid.post.ts`; repurpose `mark-paid.post.ts` to settle-all; both recompute parent `invoices.status`
4. Server: `index.get.ts` list endpoint gains `stats` block
5. Server: `duplicate.post.ts` clones the installment plan
6. `InvoiceForm.vue`: add the "خطة الدفع" split UI
7. `pages/admin/invoices/[id].vue`: per-installment payment UI
8. `pages/admin/invoices/index.vue`: stats bar + `partially_paid` filter/badge
9. `pages/i/[slug].vue`: public schedule table
10. Local end-to-end exercise (see Testing above)
11. Deploy preflight + apply remote migration
