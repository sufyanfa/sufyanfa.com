-- Add pricing tracking columns to proposals.
-- Both nullable: existing rows get NULL ("not tracked"), counted as 0 in aggregates.
-- Amounts stored as halalas (SAR × 100), matching invoice system convention.

ALTER TABLE proposals ADD COLUMN price                INTEGER;
ALTER TABLE proposals ADD COLUMN price_after_discount INTEGER;
