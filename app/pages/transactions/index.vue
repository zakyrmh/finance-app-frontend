<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import type { TransactionType, TransactionItemPayload } from '~/types/transaction'

// SEO Meta
useSeoMeta({
  title: 'Riwayat & Catat Transaksi - Waletify Personal Finance',
  description: 'Catat pemasukan, pengeluaran, transfer antar dompet, dan split bill pelunasan hutang.'
})

// Protected Route Middleware
definePageMeta({
  middleware: 'auth',
  title: 'Pencatatan Transaksi'
})

const { 
  transactions, 
  loading: transactionsLoading, 
  totalIncomeAmount, 
  totalExpenseAmount, 
  fetchTransactions, 
  createTransaction 
} = useTransactions()

const { wallets, fetchWallets } = useWallets()
const { categories, incomeCategories, expenseCategories, fetchCategories } = useCategories()
const { debts, fetchDebts } = useDebts()

const activeTypeFilter = ref<'all' | 'income' | 'expense' | 'transfer'>('all')
const activeWalletFilter = ref<string | null>(null)

// Modal State
const showCreateModal = ref(false)
const actionLoading = ref(false)
const formError = ref('')

// Form State
const transactionForm = reactive({
  type: 'expense' as TransactionType,
  wallet_id: '',
  to_wallet_id: '',
  category_id: '',
  description: '',
  transfer_amount: 0,
  selected_debt_id: ''
})

// Form Dynamic Items
const formItems = ref<Array<{ item_name: string; qty: number; price: number; is_split: boolean }>>([
  { item_name: '', qty: 1, price: 0, is_split: false }
])

// Currency Formatter
function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

function formatDate(dateString: string): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

// Estimated Realtime Total Calculation for UI Pratinjau
const estimatedFormTotal = computed(() => {
  if (transactionForm.type === 'transfer') {
    return transactionForm.transfer_amount || 0
  }
  return formItems.value.reduce((sum, item) => sum + ((item.qty || 0) * (item.price || 0)), 0)
})

// Filtered Transactions
const displayedTransactions = computed(() => {
  let list = transactions.value

  if (activeTypeFilter.value !== 'all') {
    list = list.filter(t => t.type === activeTypeFilter.value)
  }

  if (activeWalletFilter.value) {
    list = list.filter(t => t.wallet_id === activeWalletFilter.value)
  }

  return list
})

// Helper to get Wallet Name
function getWalletName(walletId: string): string {
  const w = wallets.value.find(item => item.id === walletId)
  return w ? w.name : 'Dompet'
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && showCreateModal.value) {
    showCreateModal.value = false
  }
}

// Initial Fetch
onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)
  try {
    await fetchTransactions()
    await fetchWallets()
    await fetchCategories()
    await fetchDebts()
  } catch (_) {
    // Handled by composable states
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// Handlers
function openCreateModal(defaultType: TransactionType = 'expense') {
  transactionForm.type = defaultType
  transactionForm.wallet_id = wallets.value[0]?.id || ''
  transactionForm.to_wallet_id = wallets.value[1]?.id || ''
  transactionForm.category_id = ''
  transactionForm.description = ''
  transactionForm.transfer_amount = 0
  transactionForm.selected_debt_id = ''

  formItems.value = [{ item_name: '', qty: 1, price: 0, is_split: false }]
  formError.value = ''
  showCreateModal.value = true
}

function addItemRow() {
  formItems.value.push({ item_name: '', qty: 1, price: 0, is_split: transactionForm.type === 'expense' && !!transactionForm.selected_debt_id })
}

function removeItemRow(index: number) {
  if (formItems.value.length > 1) {
    formItems.value.splice(index, 1)
  }
}

async function handleCreateTransaction() {
  formError.value = ''

  if (!transactionForm.wallet_id) {
    formError.value = 'Dompet utama/asal wajib dipilih'
    return
  }

  if (transactionForm.type === 'transfer') {
    if (!transactionForm.to_wallet_id) {
      formError.value = 'Dompet tujuan transfer wajib dipilih'
      return
    }
    if (transactionForm.wallet_id === transactionForm.to_wallet_id) {
      formError.value = 'Dompet asal dan dompet tujuan transfer tidak boleh sama'
      return
    }
    if (!transactionForm.transfer_amount || transactionForm.transfer_amount <= 0) {
      formError.value = 'Nominal transfer harus lebih dari 0'
      return
    }
  } else {
    // Validate items
    for (let i = 0; i < formItems.value.length; i++) {
      const item = formItems.value[i]
      if (!item || !item.item_name.trim()) {
        formError.value = `Nama item ke-${i + 1} wajib diisi`
        return
      }
      if (!item.qty || item.qty <= 0) {
        formError.value = `Jumlah (qty) item ke-${i + 1} harus lebih dari 0`
        return
      }
      if (item.price < 0) {
        formError.value = `Harga item ke-${i + 1} tidak boleh negatif`
        return
      }
    }
  }

  actionLoading.value = true

  try {
    // Construct items payload
    let itemsPayload: TransactionItemPayload[] = []

    if (transactionForm.type === 'transfer') {
      itemsPayload = [
        {
          item_name: 'Transfer saldo',
          qty: 1,
          price: Number(transactionForm.transfer_amount),
          is_split: false
        }
      ]
    } else {
      itemsPayload = formItems.value.map(item => ({
        item_name: item.item_name.trim(),
        qty: Number(item.qty),
        price: Number(item.price),
        is_split: item.is_split || (transactionForm.type === 'expense' && !!transactionForm.selected_debt_id),
        debt_id: (item.is_split || !!transactionForm.selected_debt_id) ? transactionForm.selected_debt_id || undefined : undefined
      }))
    }

    await createTransaction({
      type: transactionForm.type,
      wallet_id: transactionForm.wallet_id,
      to_wallet_id: transactionForm.type === 'transfer' ? transactionForm.to_wallet_id : undefined,
      category_id: transactionForm.category_id || undefined,
      description: transactionForm.description.trim() || undefined,
      items: itemsPayload
    })

    // Refetch wallets & debts so updated balances & debt progress reflect immediately!
    await fetchWallets()
    await fetchDebts()

    showCreateModal.value = false
  } catch (err: any) {
    formError.value = err?.data?.error || err?.message || 'Gagal mencatat transaksi baru'
  } finally {
    actionLoading.value = false
  }
}
</script>

<template>
  <NuxtLayout>
    <template #header-action>
      <button 
        @click="openCreateModal('expense')"
        class="py-2 px-3.5 bg-indigo hover:bg-indigo/90 text-canvas font-body text-xs sm:text-sm font-semibold rounded-buttons transition-all shadow-xs flex items-center gap-2 cursor-pointer"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Catat Transaksi</span>
      </button>
    </template>

    <div class="space-y-8">
          
          <!-- Summary Metric Cards Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Total Income Card -->
            <div class="bg-canvas p-6 rounded-[16px] border border-hairline shadow-xs">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-slate uppercase tracking-wider">Total Pemasukan</span>
                <span class="w-7 h-7 rounded-lg bg-emerald/10 text-emerald flex items-center justify-center text-xs font-bold">↓</span>
              </div>
              <div class="font-mono text-2.5xl sm:text-3xl font-semibold text-emerald tracking-tight">
                {{ formatRupiah(totalIncomeAmount) }}
              </div>
              <p class="text-xs text-slate mt-1.5">Arus kas masuk</p>
            </div>

            <!-- Total Expense Card -->
            <div class="bg-canvas p-6 rounded-[16px] border border-hairline shadow-xs">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-slate uppercase tracking-wider">Total Pengeluaran</span>
                <span class="w-7 h-7 rounded-lg bg-coral/10 text-coral flex items-center justify-center text-xs font-bold">↑</span>
              </div>
              <div class="font-mono text-2.5xl sm:text-3xl font-semibold text-coral tracking-tight">
                {{ formatRupiah(totalExpenseAmount) }}
              </div>
              <p class="text-xs text-slate mt-1.5">Arus kas keluar</p>
            </div>

            <!-- Total Transactions Count -->
            <div class="bg-canvas p-6 rounded-[16px] border border-hairline shadow-xs">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-slate uppercase tracking-wider">Total Transaksi</span>
                <span class="w-7 h-7 rounded-lg bg-paper border border-hairline text-ink flex items-center justify-center text-xs font-bold">📑</span>
              </div>
              <div class="font-mono text-2.5xl sm:text-3xl font-semibold text-ink tracking-tight">
                {{ transactions.length }}
              </div>
              <p class="text-xs text-slate mt-1.5">Catatan transaksi</p>
            </div>
          </div>

          <!-- Main Transactions History Container -->
          <div class="bg-canvas p-6 sm:p-8 rounded-[16px] border border-hairline shadow-xs space-y-6">
            
            <!-- Header & Filters -->
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-hairline">
              <div>
                <h3 class="font-display text-lg font-semibold text-ink tracking-tight">
                  Riwayat Transaksi Keuangan
                </h3>
                <p class="text-xs text-slate mt-0.5">
                  Daftar histori pencatatan pemasukan, pengeluaran, transfer, dan split bill.
                </p>
              </div>

              <!-- Double Controls: Type Tabs & Wallet Filter -->
              <div class="flex flex-wrap items-center gap-3">
                <!-- Type Switcher -->
                <div class="inline-flex bg-paper p-1 rounded-xl border border-hairline">
                  <button 
                    @click="activeTypeFilter = 'all'"
                    :class="[
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                      activeTypeFilter === 'all' ? 'bg-canvas text-ink shadow-2xs border border-hairline/60' : 'text-slate hover:text-ink'
                    ]"
                  >
                    Semua
                  </button>

                  <button 
                    @click="activeTypeFilter = 'income'"
                    :class="[
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1',
                      activeTypeFilter === 'income' ? 'bg-canvas text-emerald shadow-2xs border border-hairline/60' : 'text-slate hover:text-emerald'
                    ]"
                  >
                    <span>↓ Pemasukan</span>
                  </button>

                  <button 
                    @click="activeTypeFilter = 'expense'"
                    :class="[
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1',
                      activeTypeFilter === 'expense' ? 'bg-canvas text-coral shadow-2xs border border-hairline/60' : 'text-slate hover:text-coral'
                    ]"
                  >
                    <span>↑ Pengeluaran</span>
                  </button>

                  <button 
                    @click="activeTypeFilter = 'transfer'"
                    :class="[
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1',
                      activeTypeFilter === 'transfer' ? 'bg-canvas text-indigo shadow-2xs border border-hairline/60' : 'text-slate hover:text-indigo'
                    ]"
                  >
                    <span>⇄ Transfer</span>
                  </button>
                </div>

                <!-- Wallet Select Filter -->
                <select
                  v-model="activeWalletFilter"
                  class="px-3 py-1.5 bg-paper text-ink text-xs font-semibold border border-hairline rounded-xl focus:outline-none focus:border-indigo"
                >
                  <option :value="null">Semua Dompet</option>
                  <option v-for="w in wallets" :key="w.id" :value="w.id">
                    {{ w.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="transactionsLoading" class="py-12 text-center text-slate text-sm font-mono animate-pulse">
              Memuat riwayat transaksi...
            </div>

            <!-- Empty State -->
            <div 
              v-else-if="displayedTransactions.length === 0" 
              class="py-12 text-center text-slate text-sm flex flex-col items-center justify-center"
            >
              <div class="w-14 h-14 bg-paper rounded-2xl flex items-center justify-center text-slate mb-3 border border-hairline">
                💸
              </div>
              <h4 class="font-display text-base font-semibold text-ink mb-1">Belum Ada Transaksi</h4>
              <p class="text-xs text-slate max-w-sm mb-4">
                Mulai catat transaksi pemasukan atau pengeluaran pertama Anda.
              </p>
              <button 
                @click="openCreateModal('expense')"
                class="py-2 px-4 bg-indigo hover:bg-indigo/90 text-canvas font-body text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                + Catat Transaksi Baru
              </button>
            </div>

            <!-- Transaction Table / List -->
            <div v-else class="divide-y divide-hairline">
              <div 
                v-for="trx in displayedTransactions" 
                :key="trx.id"
                class="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-paper/40 px-3 rounded-xl transition-colors"
              >
                <div class="flex items-center gap-3.5 min-w-0">
                  <!-- Icon Badge Type -->
                  <div 
                    :class="[
                      'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0',
                      trx.type === 'income' ? 'bg-emerald/10 text-emerald' : 
                      trx.type === 'expense' ? 'bg-coral/10 text-coral' : 'bg-indigo/10 text-indigo'
                    ]"
                  >
                    {{ trx.type === 'income' ? '↓' : trx.type === 'expense' ? '↑' : '⇄' }}
                  </div>

                  <div class="truncate">
                    <div class="flex items-center gap-2 mb-0.5">
                      <p class="text-sm font-semibold text-ink truncate">
                        {{ trx.description || (trx.type === 'income' ? 'Pemasukan Kas' : trx.type === 'expense' ? 'Pengeluaran Kas' : 'Transfer Antar Dompet') }}
                      </p>
                      <span 
                        :class="[
                          'text-[10px] font-semibold font-mono uppercase px-2 py-0.5 rounded-full shrink-0',
                          trx.type === 'income' ? 'bg-emerald/10 text-emerald' : 
                          trx.type === 'expense' ? 'bg-coral/10 text-coral' : 'bg-indigo/10 text-indigo'
                        ]"
                      >
                        {{ trx.type }}
                      </span>
                    </div>

                    <p class="text-xs text-slate font-mono truncate">
                      <span class="font-semibold text-ink">{{ getWalletName(trx.wallet_id) }}</span> · {{ trx.reference_code }} · {{ formatDate(trx.created_at) }}
                    </p>
                  </div>
                </div>

                <!-- Transaction Amount (IBM Plex Mono) -->
                <div class="text-left sm:text-right shrink-0">
                  <div 
                    :class="[
                      'font-mono text-base sm:text-lg font-semibold tracking-tight',
                      trx.type === 'income' ? 'text-emerald' : trx.type === 'expense' ? 'text-coral' : 'text-indigo'
                    ]"
                  >
                    {{ trx.type === 'income' ? '+' : trx.type === 'expense' ? '-' : '' }}{{ formatRupiah(trx.total_amount) }}
                  </div>
                  <span class="text-[11px] text-slate font-mono">Dihitung otomatis oleh DB trigger</span>
                </div>
              </div>
            </div>

          </div>

    </div>
  </NuxtLayout>

    <!-- MODAL FORM: CREATE TRANSACTION INTERACTIVE BUILDER -->
    <div 
      v-if="showCreateModal" 
      class="fixed inset-0 z-50 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-modal-title"
      @click.self="showCreateModal = false"
    >
      <div class="bg-canvas w-full max-w-2xl rounded-[16px] border border-hairline shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden">
        
        <!-- Modal Header (Fixed Top) -->
        <div class="px-6 py-4 sm:px-8 sm:py-5 border-b border-hairline flex items-center justify-between shrink-0 bg-canvas">
          <div>
            <h3 id="transaction-modal-title" class="font-display text-lg sm:text-xl font-semibold text-ink">Catat Transaksi Baru</h3>
            <p class="text-xs text-slate">Hubungkan dompet, kategori, & pelunasan hutang.</p>
          </div>
          <button @click="showCreateModal = false" type="button" aria-label="Tutup form transaksi" class="text-slate hover:text-ink p-1.5 rounded-lg hover:bg-paper transition-colors cursor-pointer">✕</button>
        </div>

        <!-- Modal Form Container -->
        <form @submit.prevent="handleCreateTransaction" class="flex flex-col flex-1 min-h-0">
          
          <!-- Modal Body (Scrollable Content) -->
          <div class="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
            
            <!-- Mode Segmented Tab Selector -->
            <div>
              <label class="block font-body text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                Tipe Transaksi
              </label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-paper p-1.5 rounded-xl border border-hairline">
                <button 
                  type="button"
                  @click="transactionForm.type = 'expense'"
                  :class="[
                    'py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer',
                    transactionForm.type === 'expense' ? 'bg-canvas text-coral shadow-2xs border border-coral/30' : 'text-slate hover:text-ink'
                  ]"
                >
                  <span>↑ Pengeluaran</span>
                </button>

                <button 
                  type="button"
                  @click="transactionForm.type = 'income'"
                  :class="[
                    'py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer',
                    transactionForm.type === 'income' ? 'bg-canvas text-emerald shadow-2xs border border-emerald/30' : 'text-slate hover:text-ink'
                  ]"
                >
                  <span>↓ Pemasukan</span>
                </button>

                <button 
                  type="button"
                  @click="transactionForm.type = 'transfer'"
                  :class="[
                    'py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer',
                    transactionForm.type === 'transfer' ? 'bg-canvas text-indigo shadow-2xs border border-indigo/30' : 'text-slate hover:text-ink'
                  ]"
                >
                  <span>⇄ Transfer</span>
                </button>

                <button 
                  type="button"
                  @click="transactionForm.type = 'expense'; transactionForm.selected_debt_id = debts[0]?.id || ''"
                  :class="[
                    'py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer',
                    (transactionForm.type === 'expense' && !!transactionForm.selected_debt_id) ? 'bg-canvas text-indigo shadow-2xs border border-indigo/30' : 'text-slate hover:text-ink'
                  ]"
                >
                  <span>📜 Split Bill</span>
                </button>
              </div>
            </div>

            <!-- Section 1: Wallet & Category Selector Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <!-- Main Wallet (wallet_id) -->
              <div>
                <label for="form-wallet" class="block font-body text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  {{ transactionForm.type === 'transfer' ? 'Dompet Asal' : transactionForm.type === 'income' ? 'Dompet Penerima' : 'Dompet Sumber Kas' }}
                </label>
                <select 
                  id="form-wallet"
                  v-model="transactionForm.wallet_id"
                  :disabled="actionLoading"
                  class="w-full px-4 py-2.5 bg-canvas text-ink text-sm font-body border border-hairline focus:border-indigo focus:ring-1 focus:ring-indigo rounded-inputs focus:outline-none"
                >
                  <option v-for="w in wallets" :key="w.id" :value="w.id">
                    {{ w.name }} (Saldo: {{ formatRupiah(w.balance) }})
                  </option>
                </select>
              </div>

              <!-- Target Wallet (for Transfer ONLY) -->
              <div v-if="transactionForm.type === 'transfer'">
                <label for="form-to-wallet" class="block font-body text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Dompet Tujuan Transfer
                </label>
                <select 
                  id="form-to-wallet"
                  v-model="transactionForm.to_wallet_id"
                  :disabled="actionLoading"
                  class="w-full px-4 py-2.5 bg-canvas text-ink text-sm font-body border border-hairline focus:border-indigo focus:ring-1 focus:ring-indigo rounded-inputs focus:outline-none"
                >
                  <option v-for="w in wallets" :key="w.id" :value="w.id">
                    {{ w.name }} (Saldo: {{ formatRupiah(w.balance) }})
                  </option>
                </select>
              </div>

              <!-- Category Selector (for Income & Expense) -->
              <div v-else>
                <label for="form-category" class="block font-body text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Kategori Transaksi (Opsional)
                </label>
                <select 
                  id="form-category"
                  v-model="transactionForm.category_id"
                  :disabled="actionLoading"
                  class="w-full px-4 py-2.5 bg-canvas text-ink text-sm font-body border border-hairline focus:border-indigo focus:ring-1 focus:ring-indigo rounded-inputs focus:outline-none"
                >
                  <option value="">-- Tanpa Kategori --</option>
                  <option 
                    v-for="cat in (transactionForm.type === 'income' ? incomeCategories : expenseCategories)" 
                    :key="cat.id" 
                    :value="cat.id"
                  >
                    {{ cat.name }} ({{ cat.type }})
                  </option>
                </select>
              </div>
            </div>

            <!-- Section 2: Split Bill / Debt Linker (Optional for Expense) -->
            <div v-if="transactionForm.type === 'expense'" class="p-4 bg-paper rounded-xl border border-hairline space-y-2">
              <div class="flex items-center justify-between">
                <label for="form-debt" class="font-body text-xs font-semibold text-ink uppercase tracking-wider">
                  Tautkan Pelunasan Hutang / Split Bill (Opsional)
                </label>
                <span class="text-[11px] text-indigo font-mono">DB Trigger Auto-Pay</span>
              </div>

              <select 
                id="form-debt"
                v-model="transactionForm.selected_debt_id"
                :disabled="actionLoading"
                class="w-full px-3.5 py-2 bg-canvas text-ink text-xs font-body border border-hairline rounded-lg focus:outline-none focus:border-indigo"
              >
                <option value="">-- Tidak Ada Pelunasan Hutang --</option>
                <option v-for="d in debts" :key="d.id" :value="d.id">
                  {{ d.counterparty_name }} ({{ d.type === 'receivable' ? 'Piutang' : 'Hutang' }}) - Sisa: {{ formatRupiah(Math.max(0, d.total_amount - d.paid_amount)) }}
                </option>
              </select>
              <p class="text-[11px] text-slate">
                Jika ditautkan, item transaksi split bill ini akan otomatis memperbarui `paid_amount` dan status `paid_off` kontak terkait.
              </p>
            </div>

            <!-- Section 3: Description -->
            <div>
              <label for="form-description" class="block font-body text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Deskripsi / Catatan Transaksi
              </label>
              <input 
                id="form-description"
                v-model="transactionForm.description"
                type="text"
                placeholder="Contoh: Gaji bulan ini, Makan siang bareng Budi, Topup e-wallet"
                :disabled="actionLoading"
                class="w-full px-4 py-2.5 bg-canvas text-ink placeholder:text-silver text-sm font-body border border-hairline focus:border-indigo focus:ring-1 focus:ring-indigo rounded-inputs focus:outline-none"
              />
            </div>

            <!-- Section 4: Transfer Amount (FOR TRANSFER ONLY) -->
            <div v-if="transactionForm.type === 'transfer'">
              <label for="form-transfer-amount" class="block font-body text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Nominal Transfer (IDR)
              </label>
              <input 
                id="form-transfer-amount"
                v-model.number="transactionForm.transfer_amount"
                type="number"
                min="1"
                placeholder="0"
                :disabled="actionLoading"
                class="w-full px-4 py-2.5 bg-canvas text-ink placeholder:text-silver text-sm font-mono border border-hairline focus:border-indigo focus:ring-1 focus:ring-indigo rounded-inputs focus:outline-none"
              />
            </div>

            <!-- Section 5: Dynamic Multi-Item Builder (FOR INCOME & EXPENSE) -->
            <div v-else class="space-y-3">
              <div class="flex items-center justify-between pt-2 border-t border-hairline">
                <label class="block font-body text-xs font-semibold text-ink uppercase tracking-wider">
                  Daftar Item Transaksi (Minimal 1 Item)
                </label>
                
                <button 
                  type="button"
                  @click="addItemRow"
                  class="text-xs font-semibold text-indigo hover:text-indigo/80 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>+ Tambah Item</span>
                </button>
              </div>

              <!-- Dynamic Items Rows -->
              <div class="space-y-3">
                <div 
                  v-for="(item, index) in formItems" 
                  :key="index"
                  class="p-3.5 bg-paper/60 rounded-xl border border-hairline flex flex-col sm:flex-row items-start sm:items-center gap-3 relative"
                >
                  <!-- Item Name -->
                  <div class="flex-1 w-full">
                    <input 
                      v-model="item.item_name"
                      type="text"
                      :placeholder="`Item ${index + 1} (Contoh: Nasi Goreng, Jam Lembur)`"
                      :disabled="actionLoading"
                      class="w-full px-3 py-2 bg-canvas text-ink placeholder:text-silver text-xs font-body border border-hairline rounded-lg focus:outline-none focus:border-indigo"
                    />
                  </div>

                  <!-- Qty & Price -->
                  <div class="flex items-center gap-2 w-full sm:w-auto">
                    <div class="w-20">
                      <input 
                        v-model.number="item.qty"
                        type="number"
                        min="1"
                        placeholder="Qty"
                        :disabled="actionLoading"
                        class="w-full px-2.5 py-2 bg-canvas text-ink text-xs font-mono border border-hairline rounded-lg focus:outline-none focus:border-indigo"
                      />
                    </div>

                    <div class="w-32">
                      <input 
                        v-model.number="item.price"
                        type="number"
                        min="0"
                        placeholder="Harga"
                        :disabled="actionLoading"
                        class="w-full px-2.5 py-2 bg-canvas text-ink text-xs font-mono border border-hairline rounded-lg focus:outline-none focus:border-indigo"
                      />
                    </div>

                    <!-- Remove Item Button -->
                    <button 
                      v-if="formItems.length > 1"
                      type="button"
                      @click="removeItemRow(index)"
                      class="p-1.5 text-slate hover:text-coral transition-colors shrink-0 cursor-pointer"
                      title="Hapus Item"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Total Preview & DB Trigger Info -->
            <div class="p-4 bg-paper rounded-xl border border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span class="text-xs font-semibold text-slate uppercase tracking-wider block">Estimasi Total Pratinjau:</span>
                <span class="text-xs text-slate">Total dihitung dan diverifikasi otomatis oleh backend</span>
              </div>
              <div class="font-mono text-xl sm:text-2xl font-semibold text-ink">
                {{ formatRupiah(estimatedFormTotal) }}
              </div>
            </div>

            <p v-if="formError" class="text-xs text-coral font-body">
              {{ formError }}
            </p>
          </div>

          <!-- Modal Footer (Fixed Bottom Buttons) -->
          <div class="px-6 py-4 sm:px-8 sm:py-5 border-t border-hairline flex items-center justify-end gap-3 shrink-0 bg-canvas">
            <button 
              type="button" 
              @click="showCreateModal = false"
              :disabled="actionLoading"
              class="py-2.5 px-4 text-slate hover:text-ink font-body text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit" 
              :disabled="actionLoading"
              class="py-2.5 px-5 bg-indigo hover:bg-indigo/90 text-canvas font-body text-sm font-semibold rounded-lg transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {{ actionLoading ? 'Mencatat...' : 'Simpan Transaksi' }}
            </button>
          </div>

        </form>

      </div>
    </div>
</template>
