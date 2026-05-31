// Money is stored as integer halalas (1 SAR = 100 halalas) to avoid float drift.
// Formatting happens only at the leaf, via Intl.NumberFormat with Arabic locale.

export const toMinor = (sar: number): number => Math.round(sar * 100)
export const fromMinor = (h: number): number => h / 100

export function formatSAR(halalas: number): string {
  return new Intl.NumberFormat('ar-SA-u-nu-latn', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(halalas / 100)
}

export function computeTotals(items: { amount: number }[], adjustment: number) {
  const subtotal = items.reduce((s, i) => s + (i.amount ?? 0), 0)
  const total = subtotal + (adjustment ?? 0)
  return { subtotal, adjustment, total }
}
