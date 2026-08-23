import type { Wallet, WalletListResponse, WalletResponse, CreateWalletPayload, UpdateWalletPayload } from '~/types/wallet'

export function useWallets() {
  const api = useApi()
  const wallets = useState<Wallet[]>('wallets:list', () => [])
  const loading = useState<boolean>('wallets:loading', () => false)
  const error = useState<string | null>('wallets:error', () => null)

  const totalBalance = computed(() => {
    return wallets.value.reduce((sum, wallet) => sum + (wallet.balance || 0), 0)
  })

  async function fetchWallets(page = 1, limit = 50) {
    loading.value = true
    error.value = null
    try {
      const response = await api<WalletListResponse>(`/wallets?page=${page}&limit=${limit}`, {
        method: 'GET'
      })
      wallets.value = response.data || []
      return response.data
    } catch (err: any) {
      error.value = err?.data?.error || err?.message || 'Gagal mengambil data dompet'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createWallet(payload: CreateWalletPayload) {
    error.value = null
    try {
      const response = await api<WalletResponse>('/wallets', {
        method: 'POST',
        body: payload
      })
      if (response.data) {
        wallets.value.push(response.data)
      }
      return response.data
    } catch (err: any) {
      error.value = err?.data?.error || err?.message || 'Gagal membuat dompet'
      throw err
    }
  }

  async function updateWallet(id: string, payload: UpdateWalletPayload) {
    error.value = null
    try {
      await api<{ message: string }>(`/wallets/${id}`, {
        method: 'PUT',
        body: payload
      })
      // Update name locally in state
      const target = wallets.value.find(w => w.id === id)
      if (target) {
        target.name = payload.name
        target.updated_at = new Date().toISOString()
      }
    } catch (err: any) {
      error.value = err?.data?.error || err?.message || 'Gagal mengubah nama dompet'
      throw err
    }
  }

  async function deleteWallet(id: string) {
    error.value = null
    try {
      await api<{ message: string }>(`/wallets/${id}`, {
        method: 'DELETE'
      })
      // Remove locally from state
      wallets.value = wallets.value.filter(w => w.id !== id)
    } catch (err: any) {
      error.value = err?.data?.error || err?.message || 'Gagal menghapus dompet'
      throw err
    }
  }

  return {
    wallets,
    loading,
    error,
    totalBalance,
    fetchWallets,
    createWallet,
    updateWallet,
    deleteWallet
  }
}
