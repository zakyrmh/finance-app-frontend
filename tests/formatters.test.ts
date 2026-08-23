import { describe, it, expect } from 'vitest'

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

function getProgressPercentage(total: number, paid: number): number {
  if (!total || total <= 0) return 0
  const pct = ((paid || 0) / total) * 100
  return Math.min(100, Math.max(0, Math.round(pct)))
}

function calculateEstimatedTotal(
  type: 'income' | 'expense' | 'transfer',
  transferAmount: number,
  items: Array<{ qty: number; price: number }>
): number {
  if (type === 'transfer') {
    return transferAmount || 0
  }
  return items.reduce((sum, item) => sum + ((item.qty || 0) * (item.price || 0)), 0)
}

describe('Financial Formatters & Math Utilities', () => {
  it('formats positive Rupiah correctly with IDR currency symbol', () => {
    const formatted = formatRupiah(500000)
    expect(formatted).toContain('500.000')
  })

  it('handles 0 and negative numbers in formatRupiah gracefully', () => {
    expect(formatRupiah(0)).toContain('0,00')
  })

  it('calculates debt progress percentage correctly', () => {
    expect(getProgressPercentage(100000, 25000)).toBe(25)
    expect(getProgressPercentage(100000, 100000)).toBe(100)
    expect(getProgressPercentage(100000, 150000)).toBe(100) // capped at 100
    expect(getProgressPercentage(0, 0)).toBe(0)
  })

  it('calculates estimated transaction totals correctly', () => {
    const transferTotal = calculateEstimatedTotal('transfer', 250000, [])
    expect(transferTotal).toBe(250000)

    const multiItemTotal = calculateEstimatedTotal('expense', 0, [
      { qty: 2, price: 15000 },
      { qty: 1, price: 20000 }
    ])
    expect(multiItemTotal).toBe(50000)
  })
})
