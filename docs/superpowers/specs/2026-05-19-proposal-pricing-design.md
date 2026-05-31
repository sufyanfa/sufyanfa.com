# Proposal Pricing — Design

**Date:** 2026-05-19
**Status:** Approved (pending implementation plan)

## Goal

Track money on every proposal so the admin dashboard can show two numbers at a glance:

1. **Per proposal:** the original price and the price-after-discount (what the client actually pays).
2. **Across all proposals:** total income — the sum of price-after-discount across the entire proposal pipeline.

Admin-only. The public `/p/<slug>` proposal viewer stays unchanged; clients never see these numbers.

## Data Model

Add two nullable integer columns to the existing `proposals` table. Amounts are stored as **halalas** (SAR × 100), matching the invoice system's money convention.

```sql
-- migrations/0003_proposal_pricing.sql
ALTER TABLE proposals ADD COLUMN price                INTEGER;
ALTER TABLE proposals ADD COLUMN price_after_discount INTEGER;
```

- Both columns are nullable. Existing proposals get `NULL` automatically.
- `NULL` semantically means "not tracked" and counts as 0 in dashboard aggregates.
- No validation between the two values — the user is free to enter any pair (e.g., `price_after_discount > price` if they want to record a markup, though this is unusual).

## API Changes

### `POST /api/admin/proposals` (`server/api/admin/proposals/index.post.ts`)

Accept two new optional body fields:

```ts
interface CreateBody {
  // ... existing fields
  price?: number | null                // halalas
  price_after_discount?: number | null // halalas
}
```

Add both columns to the `INSERT` statement. Coerce undefined → `null` before binding.

### `PATCH /api/admin/proposals/:id` (`server/api/admin/proposals/[id].patch.ts`)

Add `price` and `price_after_discount` to the `ALLOWED` whitelist so they flow through the existing dynamic UPDATE.

### `GET /api/admin/proposals` (`server/api/admin/proposals/index.get.ts`)

Add `p.price` and `p.price_after_discount` to the SELECT projection so the dashboard list can render them per-row and compute totals client-side.

### `GET /api/admin/proposals/:id` (`server/api/admin/proposals/[id].get.ts`)

Add the same two columns to the SELECT so the edit page can prefill them.

### Public viewer API

**No changes.** The public viewer is admin-trusted, but these fields are not surfaced to the public side.

## UI Changes

### `pages/admin/proposals/new.vue` and `pages/admin/proposals/[id].vue`

Add a two-column row to the form, after the date/client fields:

```
[ السعر (ر.س.) ]   [ السعر بعد الخصم (ر.س.) ]
```

- Inputs are `type="number"` with `step="0.01"` and `min="0"`, edited as decimal SAR.
- Converted to halalas (`Math.round(sar * 100)`) before POST/PATCH.
- Empty input → `null` (preserves "not tracked" state).
- Reuse the existing `AdminProposalField` wrapper for label styling.

### `pages/admin/proposals/index.vue` (Dashboard)

**1. Income widget — above the proposals filter chips, below the existing invoice widget:**

```
┌──────────────────────────────────────────────────────────┐
│  العروض                                                  │
│                                                          │
│  الإجمالي           بعد الخصم         مجموع الخصومات     │
│  150,000.00 ر.س.    127,500.00 ر.س.   22,500.00 ر.س.    │
└──────────────────────────────────────────────────────────┘
```

Computed client-side from the existing `useFetch('/api/admin/proposals')` result. No new endpoint needed.

```ts
const proposalStats = computed(() => {
  let gross = 0, net = 0
  for (const p of proposals.value) {
    gross += p.price ?? 0
    net   += p.price_after_discount ?? p.price ?? 0
  }
  return { gross, net, discount: gross - net }
})
```

`p.price_after_discount ?? p.price` — if discount is unset but price is, treat net as gross. If both unset, contribute 0.

**2. New "السعر" column in the proposals table:**

Add a column between "الحالة" and "المشاهدات" showing the per-proposal price-after-discount (in SAR). If unset, show a muted dash `—`.

Adjust the grid from `grid-cols-12` (currently 5/3/2/1/1) to make room — final layout: `4/3/2/1/1/1` (title / client / status / price / views / date).

### `pages/p/[slug].vue` (Public viewer)

**No changes.** Out of scope.

## Non-Goals

- No history tracking (we don't record when prices changed, just the current values).
- No multi-currency — SAR halalas only, matching the invoice system.
- No "earned vs. pipeline" split — user explicitly chose to sum all proposals regardless of status.
- No charts, no trend lines, no per-status breakdowns. Just three numbers.
- Public proposal viewer stays untouched.

## Edge Cases

- **Existing proposals (pre-migration):** both columns are `NULL`. They contribute 0 to the total and show `—` in the list. User can backfill by editing.
- **Only `price` set, `price_after_discount` empty:** net falls back to `price` (no discount applied). User likely just didn't bother typing the same number twice.
- **Only `price_after_discount` set, `price` empty:** gross treats it as 0; discount column will show a negative number. Acceptable — surfaces the data-entry inconsistency without blocking the user.
- **Numbers larger than `Number.MAX_SAFE_INTEGER / 100`:** not a real concern at SAR halalas — would need a proposal over 90 trillion SAR.
- **Locale formatting:** reuse `useMoney().formatSAR()` which already uses `ar-SA-u-nu-latn` for Latin digits.

## Testing Strategy

Manual smoke test after deploy:

1. **Migration applied:** `wrangler d1 execute sufyanfa-proposals --remote --command "SELECT name FROM pragma_table_info('proposals') WHERE name IN ('price', 'price_after_discount')"` returns two rows.
2. **Existing proposals still render:** open an existing proposal in `/admin/proposals/<id>` — fields show as empty inputs, no errors.
3. **Create new proposal with price:** values save and reappear after refresh.
4. **Edit proposal price:** values update.
5. **Dashboard widget:** numbers match a manual sum of the proposals list.
6. **Empty database:** widget shows `0.00 ر.س.` × 3, no crashes.
7. **Public viewer unchanged:** open `/p/<slug>` — no new fields visible.

## Implementation Plan

To be written next via the `writing-plans` skill, capturing each change as an independently-verifiable task. Single commit at the end (matching the user's standing preference for batched commits on feature work).
