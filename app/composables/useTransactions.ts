import type { TransactionSummary, TransactionListResponse, TransactionResponse, CreateTransactionPayload } from '~/types/transaction'

export function useTransactions() {
  const api = useApi()
  const transactions = useState<TransactionSummary[]>('transactions:list', () => [])
  const loading = useState<boolean>('transactions:loading', () => false)
  const error = useState<string | null>('transactions:error', () => null)

  const incomeTransactions = computed(() => {
    return transactions.value.filter(t => t.type === 'income')
  })

  const expenseTransactions = computed(() => {
    return transactions.value.filter(t => t.type === 'expense')
  })

  const transferTransactions = computed(() => {
    return transactions.value.filter(t => t.type === 'transfer')
  })

  const totalIncomeAmount = computed(() => {
    return incomeTransactions.value.reduce((sum, t) => sum + (t.total_amount || 0), 0)
  })

  const totalExpenseAmount = computed(() => {
    return expenseTransactions.value.reduce((sum, t) => sum + (t.total_amount || 0), 0)
  })

  async function fetchTransactions(page = 1, limit = 50) {
    loading.value = true
    error.value = null
    try {
      const response = await api<TransactionListResponse>(`/transactions?page=${page}&limit=${limit}`, {
        method: 'GET'
      })
      transactions.value = response.data || []
      return response.data
    } catch (err: any) {
      error.value = err?.data?.error || err?.message || 'Gagal mengambil riwayat transaksi'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createTransaction(payload: CreateTransactionPayload) {
    error.value = null
    try {
      const response = await api<TransactionResponse>('/transactions', {
        method: 'POST',
        body: payload
      })
      if (response.data) {
        transactions.value.unshift(response.data)
      }
      return response.data
    } catch (err: any) {
      error.value = err?.data?.error || err?.message || 'Gagal mencatat transaksi'
      throw err
    }
  }

  return {
    transactions,
    loading,
    error,
    incomeTransactions,
    expenseTransactions,
    transferTransactions,
    totalIncomeAmount,
    totalExpenseAmount,
    fetchTransactions,
    createTransaction
  }
}
