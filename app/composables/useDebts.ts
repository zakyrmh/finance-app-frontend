import type { Debt, DebtListResponse, DebtResponse, CreateDebtPayload, UpdateDebtPayload } from '~/types/debt'

export function useDebts() {
  const api = useApi()
  const debts = useState<Debt[]>('debts:list', () => [])
  const loading = useState<boolean>('debts:loading', () => false)
  const error = useState<string | null>('debts:error', () => null)

  const payables = computed(() => {
    return debts.value.filter(d => d.type === 'payable')
  })

  const receivables = computed(() => {
    return debts.value.filter(d => d.type === 'receivable')
  })

  const totalReceivableRemaining = computed(() => {
    return receivables.value.reduce((sum, debt) => {
      const remaining = Math.max(0, (debt.total_amount || 0) - (debt.paid_amount || 0))
      return sum + remaining
    }, 0)
  })

  const totalPayableRemaining = computed(() => {
    return payables.value.reduce((sum, debt) => {
      const remaining = Math.max(0, (debt.total_amount || 0) - (debt.paid_amount || 0))
      return sum + remaining
    }, 0)
  })

  async function fetchDebts(page = 1, limit = 50) {
    loading.value = true
    error.value = null
    try {
      const response = await api<DebtListResponse>(`/debts?page=${page}&limit=${limit}`, {
        method: 'GET'
      })
      debts.value = response.data || []
      return response.data
    } catch (err: any) {
      error.value = err?.data?.error || err?.message || 'Gagal mengambil data hutang/piutang'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createDebt(payload: CreateDebtPayload) {
    error.value = null
    try {
      const response = await api<DebtResponse>('/debts', {
        method: 'POST',
        body: payload
      })
      if (response.data) {
        debts.value.unshift(response.data)
      }
      return response.data
    } catch (err: any) {
      error.value = err?.data?.error || err?.message || 'Gagal mencatat hutang/piutang baru'
      throw err
    }
  }

  async function updateDebt(id: string, payload: UpdateDebtPayload) {
    error.value = null
    try {
      await api<{ message: string }>(`/debts/${id}`, {
        method: 'PUT',
        body: payload
      })
      const target = debts.value.find(d => d.id === id)
      if (target) {
        target.counterparty_name = payload.counterparty_name
        target.total_amount = payload.total_amount
        target.updated_at = new Date().toISOString()
      }
    } catch (err: any) {
      error.value = err?.data?.error || err?.message || 'Gagal memperbarui catatan hutang/piutang'
      throw err
    }
  }

  async function deleteDebt(id: string) {
    error.value = null
    try {
      await api<{ message: string }>(`/debts/${id}`, {
        method: 'DELETE'
      })
      debts.value = debts.value.filter(d => d.id !== id)
    } catch (err: any) {
      error.value = err?.data?.error || err?.message || 'Gagal menghapus catatan hutang/piutang'
      throw err
    }
  }

  return {
    debts,
    loading,
    error,
    payables,
    receivables,
    totalReceivableRemaining,
    totalPayableRemaining,
    fetchDebts,
    createDebt,
    updateDebt,
    deleteDebt
  }
}
