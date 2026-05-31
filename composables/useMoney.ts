// Client-side mirror of server/utils/money.ts. Importing server/utils into
// pages/components pulls in server-only code, so we duplicate the small surface.

export function useMoney() {
  const toMinor = (sar: number): number => Math.round(sar * 100)
  const fromMinor = (h: number): number => h / 100
  const formatSAR = (halalas: number): string =>
    new Intl.NumberFormat('ar-SA-u-nu-latn', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(halalas / 100)
  const computeTotals = (items: { amount: number }[], adjustment: number) => {
    const subtotal = items.reduce((s, i) => s + (i.amount ?? 0), 0)
    return { subtotal, adjustment, total: subtotal + (adjustment ?? 0) }
  }
  return { toMinor, fromMinor, formatSAR, computeTotals }
}
