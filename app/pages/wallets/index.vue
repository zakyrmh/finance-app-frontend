<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Wallet } from '~/types/wallet'

// SEO Meta
useSeoMeta({
  title: 'Manajemen Dompet - Waletify Personal Finance',
  description: 'Kelola daftar dompet, rekening bank, dan e-wallet Anda di Waletify.'
})

// Protected Route Middleware
definePageMeta({
  middleware: 'auth',
  title: 'Manajemen Dompet'
})

const { wallets, loading: walletsLoading, totalBalance, fetchWallets, createWallet, updateWallet, deleteWallet } = useWallets()
const { transactions, loading: transactionsLoading, fetchTransactions } = useTransactions()

// Modals State
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

// Active Editing / Deleting Target
const selectedWalletForFilter = ref<string | null>(null)
const editingWallet = ref<Wallet | null>(null)
const deletingWallet = ref<Wallet | null>(null)

// Forms State
const createForm = reactive({
  name: ''
})
const createFormError = ref('')

const editForm = reactive({
  name: ''
})
const editFormError = ref('')

const actionLoading = ref(false)
const deleteErrorMessage = ref('')

// Currency Formatter Helper
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

// Filtered Transactions
const filteredTransactions = computed(() => {
  if (!selectedWalletForFilter.value) {
    return transactions.value
  }
  return transactions.value.filter(t => t.wallet_id === selectedWalletForFilter.value)
})

const selectedWalletName = computed(() => {
  if (!selectedWalletForFilter.value) return 'Semua Dompet'
  const w = wallets.value.find(item => item.id === selectedWalletForFilter.value)
  return w ? w.name : 'Dompet Terpilih'
})

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    showCreateModal.value = false
    showEditModal.value = false
    showDeleteModal.value = false
  }
}

// Initial Fetch
onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)
  try {
    await fetchWallets()
    await fetchTransactions()
  } catch (_) {
    // Handled by composable state
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// Handlers
function openCreateModal() {
  createForm.name = ''
  createFormError.value = ''
  showCreateModal.value = true
}

async function handleCreateWallet() {
  createFormError.value = ''
  if (!createForm.name.trim()) {
    createFormError.value = 'Nama dompet wajib diisi'
    return
  }

  actionLoading.value = true
  try {
    await createWallet({ name: createForm.name.trim() })
    showCreateModal.value = false
    createForm.name = ''
  } catch (err: any) {
    createFormError.value = err?.data?.error || err?.message || 'Gagal menambahkan dompet baru'
  } finally {
    actionLoading.value = false
  }
}

function openEditModal(wallet: Wallet) {
  editingWallet.value = wallet
  editForm.name = wallet.name
  editFormError.value = ''
  showEditModal.value = true
}

async function handleEditWallet() {
  if (!editingWallet.value) return
  editFormError.value = ''
  if (!editForm.name.trim()) {
    editFormError.value = 'Nama dompet wajib diisi'
    return
  }

  actionLoading.value = true
  try {
    await updateWallet(editingWallet.value.id, { name: editForm.name.trim() })
    showEditModal.value = false
    editingWallet.value = null
  } catch (err: any) {
    editFormError.value = err?.data?.error || err?.message || 'Gagal mengedit nama dompet'
  } finally {
    actionLoading.value = false
  }
}

function openDeleteModal(wallet: Wallet) {
  deletingWallet.value = wallet
  deleteErrorMessage.value = ''
  showDeleteModal.value = true
}

async function handleDeleteWallet() {
  if (!deletingWallet.value) return
  deleteErrorMessage.value = ''
  actionLoading.value = true

  try {
    await deleteWallet(deletingWallet.value.id)
    if (selectedWalletForFilter.value === deletingWallet.value.id) {
      selectedWalletForFilter.value = null
    }
    showDeleteModal.value = false
    deletingWallet.value = null
  } catch (err: any) {
    if (err?.status === 409 || err?.statusCode === 409 || err?.response?.status === 409) {
      deleteErrorMessage.value = 'Dompet tidak dapat dihapus karena sudah memiliki riwayat transaksi terhubung.'
    } else {
      deleteErrorMessage.value = err?.data?.error || err?.message || 'Gagal menghapus dompet.'
    }
  } finally {
    actionLoading.value = false
  }
}

function toggleWalletFilter(walletId: string) {
  if (selectedWalletForFilter.value === walletId) {
    selectedWalletForFilter.value = null
  } else {
    selectedWalletForFilter.value = walletId
  }
}
</script>

<template>
  <NuxtLayout>
    <template #header-action>
      <button 
        @click="openCreateModal"
        class="py-2 px-3.5 bg-indigo hover:bg-indigo/90 text-canvas font-body text-xs sm:text-sm font-semibold rounded-buttons transition-all shadow-xs flex items-center gap-2 cursor-pointer"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Buat Rekening</span>
      </button>
    </template>

    <div class="space-y-8">
        
        <!-- Summary Total Balance Card (Meridian Hero Banner) -->
        <div class="bg-canvas p-6 sm:p-8 rounded-[16px] border border-hairline shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-paper rounded-full mb-3 border border-hairline">
              <span class="w-2 h-2 rounded-full bg-indigo"></span>
              <span class="font-body text-xs font-semibold text-slate uppercase tracking-wider">Konsolidasi Kas</span>
            </div>
            <h2 class="font-display text-xs sm:text-sm font-semibold text-slate uppercase tracking-wider mb-1">
              Total Saldo Seluruh Dompet
            </h2>
            <div class="font-mono text-3xl sm:text-4xl font-semibold text-ink tracking-tight">
              {{ formatRupiah(totalBalance) }}
            </div>
          </div>

          <!-- Quick Stats Pill -->
          <div class="flex items-center gap-4 sm:border-l sm:border-hairline sm:pl-8">
            <div class="bg-paper p-4 rounded-xl border border-hairline text-center min-w-[120px]">
              <span class="text-xs text-slate font-semibold block uppercase">Total Dompet</span>
              <span class="font-mono text-xl font-semibold text-ink">{{ wallets.length }}</span>
            </div>
          </div>
        </div>

        <!-- Wallets Grid Section -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-display text-lg font-semibold text-ink tracking-tight">
              Daftar Rekening & Dompet
            </h3>
            <span class="text-xs text-slate font-mono">Total: {{ wallets.length }} item</span>
          </div>

          <!-- Loading State -->
          <div v-if="walletsLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="i in 3" :key="i" class="bg-canvas p-6 rounded-[16px] border border-hairline shadow-xs animate-pulse space-y-4">
              <div class="h-5 bg-paper rounded w-1/2"></div>
              <div class="h-8 bg-paper rounded w-3/4"></div>
              <div class="h-4 bg-paper rounded w-1/3"></div>
            </div>
          </div>

          <!-- Empty Wallets State -->
          <div 
            v-else-if="wallets.length === 0" 
            class="bg-canvas p-8 sm:p-12 rounded-[16px] border border-hairline text-center flex flex-col items-center justify-center min-h-[260px]"
          >
            <div class="w-14 h-14 bg-paper rounded-2xl flex items-center justify-center text-slate mb-4 border border-hairline">
              <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h4 class="font-display text-lg font-semibold text-ink mb-1">Belum Ada Dompet</h4>
            <p class="text-slate text-sm max-w-sm mb-5 leading-relaxed">
              Anda belum memiliki dompet atau rekening tercatat. Buat dompet pertama Anda sekarang.
            </p>
            <button 
              @click="openCreateModal"
              class="py-2.5 px-4 bg-indigo hover:bg-indigo/90 text-canvas font-body text-sm font-semibold rounded-lg transition-all cursor-pointer"
            >
              + Buat Dompet Pertama
            </button>
          </div>

          <!-- Wallets Grid List -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="wallet in wallets" 
              :key="wallet.id"
              :class="[
                'bg-canvas p-6 rounded-[16px] border transition-all duration-200 flex flex-col justify-between relative group',
                selectedWalletForFilter === wallet.id 
                  ? 'border-indigo ring-2 ring-indigo/20 shadow-md' 
                  : 'border-hairline hover:border-slate/40 shadow-xs'
              ]"
            >
              <!-- Card Top Header -->
              <div>
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-indigo/10 text-indigo flex items-center justify-center font-display text-sm font-semibold shrink-0">
                      👛
                    </div>
                    <h4 class="font-display text-base font-semibold text-ink tracking-tight truncate max-w-[150px]" :title="wallet.name">
                      {{ wallet.name }}
                    </h4>
                  </div>

                  <!-- Selected Filter Indicator Badge -->
                  <button 
                    @click="toggleWalletFilter(wallet.id)"
                    :class="[
                      'text-xs font-semibold px-2.5 py-1 rounded-full transition-colors cursor-pointer',
                      selectedWalletForFilter === wallet.id 
                        ? 'bg-indigo text-canvas' 
                        : 'bg-paper text-slate hover:bg-paper/80'
                    ]"
                  >
                    {{ selectedWalletForFilter === wallet.id ? 'Filter Aktif' : 'Pilih Filter' }}
                  </button>
                </div>

                <!-- Balance Display (IBM Plex Mono) -->
                <div class="my-4">
                  <span class="text-xs font-medium text-slate uppercase tracking-wider block mb-1">Saldo Rekening</span>
                  <div class="font-mono text-2xl font-semibold text-ink tracking-tight">
                    {{ formatRupiah(wallet.balance) }}
                  </div>
                </div>
              </div>

              <!-- Card Bottom Footer Actions -->
              <div class="pt-4 border-t border-hairline flex items-center justify-between text-xs">
                <span class="text-slate font-mono text-[11px]">Dibuat: {{ formatDate(wallet.created_at) }}</span>

                <div class="flex items-center gap-2">
                  <!-- Edit Name Button -->
                  <button 
                    @click="openEditModal(wallet)"
                    class="p-1.5 text-slate hover:text-indigo rounded-md hover:bg-paper transition-colors cursor-pointer"
                    title="Ubah nama dompet"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <!-- Delete Wallet Button -->
                  <button 
                    @click="openDeleteModal(wallet)"
                    class="p-1.5 text-slate hover:text-coral rounded-md hover:bg-coral/10 transition-colors cursor-pointer"
                    title="Hapus dompet"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtered Transaction History Section -->
        <div class="bg-canvas p-6 sm:p-8 rounded-[16px] border border-hairline shadow-xs">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-hairline">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-display text-lg font-semibold text-ink tracking-tight">
                  Riwayat Transaksi Dompet
                </h3>
                <span v-if="selectedWalletForFilter" class="px-2.5 py-0.5 bg-indigo/10 text-indigo rounded-full text-xs font-semibold font-body">
                  {{ selectedWalletName }}
                </span>
              </div>
              <p class="text-slate text-xs mt-0.5">
                Menampilkan transaksi {{ selectedWalletForFilter ? `khusus dompet ${selectedWalletName}` : 'dari semua dompet' }}.
              </p>
            </div>

            <button 
              v-if="selectedWalletForFilter"
              @click="selectedWalletForFilter = null"
              class="text-xs font-semibold text-slate hover:text-ink underline decoration-hairline hover:decoration-slate underline-offset-4 cursor-pointer self-start sm:self-auto"
            >
              Reset Filter
            </button>
          </div>

          <!-- Loading State -->
          <div v-if="transactionsLoading" class="py-8 text-center text-slate text-sm font-mono animate-pulse">
            Memuat riwayat transaksi...
          </div>

          <!-- Empty State Transactions -->
          <div v-else-if="filteredTransactions.length === 0" class="py-10 text-center text-slate text-sm">
            <p class="font-semibold text-ink mb-1">Belum Ada Transaksi</p>
            <p class="text-xs opacity-75">Tidak ada riwayat transaksi yang tercatat untuk dompet ini.</p>
          </div>

          <!-- Transaction List Table -->
          <div v-else class="divide-y divide-hairline">
            <div 
              v-for="trx in filteredTransactions" 
              :key="trx.id"
              class="py-3.5 flex items-center justify-between gap-4 hover:bg-paper/40 px-2 rounded-lg transition-colors"
            >
              <div class="flex items-center gap-3 min-w-0">
                <!-- Icon Badge Type -->
                <div 
                  :class="[
                    'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                    trx.type === 'income' ? 'bg-emerald/10 text-emerald' : 
                    trx.type === 'expense' ? 'bg-coral/10 text-coral' : 'bg-indigo/10 text-indigo'
                  ]"
                >
                  {{ trx.type === 'income' ? '↓' : trx.type === 'expense' ? '↑' : '⇄' }}
                </div>

                <div class="truncate">
                  <p class="text-sm font-semibold text-ink truncate">
                    {{ trx.description || (trx.type === 'income' ? 'Pemasukan Kas' : trx.type === 'expense' ? 'Pengeluaran Kas' : 'Transfer Antar Dompet') }}
                  </p>
                  <p class="text-xs text-slate font-mono truncate">
                    {{ trx.reference_code }} · {{ formatDate(trx.created_at) }}
                  </p>
                </div>
              </div>

              <!-- Transaction Amount (IBM Plex Mono) -->
              <div class="text-right shrink-0">
                <span 
                  :class="[
                    'font-mono text-sm font-semibold',
                    trx.type === 'income' ? 'text-emerald' : trx.type === 'expense' ? 'text-coral' : 'text-ink'
                  ]"
                >
                  {{ trx.type === 'income' ? '+' : trx.type === 'expense' ? '-' : '' }}{{ formatRupiah(trx.total_amount) }}
                </span>
                <span class="block text-[11px] text-slate font-mono uppercase">{{ trx.type }}</span>
              </div>
            </div>
          </div>
        </div>
    </div>
  </NuxtLayout>

    <!-- MODAL 1: CREATE WALLET -->
    <div 
      v-if="showCreateModal" 
      class="fixed inset-0 z-50 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-wallet-modal-title"
      @click.self="showCreateModal = false"
    >
      <div class="bg-canvas w-full max-w-md rounded-[16px] border border-hairline shadow-xl p-6 sm:p-8 space-y-6">
        <div class="flex items-center justify-between border-b border-hairline pb-4">
          <div>
            <h3 id="create-wallet-modal-title" class="font-display text-lg font-semibold text-ink">Buat Dompet Baru</h3>
            <p class="text-xs text-slate">Tambahkan akun rekening, kas, atau e-wallet baru.</p>
          </div>
          <button @click="showCreateModal = false" type="button" aria-label="Tutup form buat dompet" class="text-slate hover:text-ink p-1 cursor-pointer">✕</button>
        </div>

        <form @submit.prevent="handleCreateWallet" class="space-y-4">
          <div>
            <label for="create-name" class="block font-body text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Nama Dompet / Rekening
            </label>
            <input 
              id="create-name"
              v-model="createForm.name"
              type="text"
              placeholder="Contoh: BCA Utama, Kas Harian, GoPay"
              :disabled="actionLoading"
              class="w-full px-4 py-2.5 bg-canvas text-ink placeholder:text-silver text-sm font-body border border-hairline focus:border-indigo focus:ring-1 focus:ring-indigo rounded-inputs focus:outline-none"
            />
            <p v-if="createFormError" class="mt-1 text-xs text-coral font-body">
              {{ createFormError }}
            </p>
          </div>

          <!-- Note regarding Saldo rule -->
          <div class="p-3.5 bg-paper rounded-xl border border-hairline text-xs text-slate space-y-1">
            <div class="flex items-center gap-1.5 font-semibold text-ink">
              <span class="w-2 h-2 rounded-full bg-indigo"></span>
              <span>Informasi Saldo Awal:</span>
            </div>
            <p class="text-[11px] leading-relaxed">
              Saldo awal otomatis <strong class="font-mono text-ink">Rp 0,00</strong>. Saldo dihitung dan diperbarui secara otomatis oleh backend dari histori transaksi yang Anda catat.
            </p>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
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
              {{ actionLoading ? 'Menyimpan...' : 'Simpan Dompet' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 2: EDIT WALLET NAME -->
    <div 
      v-if="showEditModal" 
      class="fixed inset-0 z-50 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-wallet-modal-title"
      @click.self="showEditModal = false"
    >
      <div class="bg-canvas w-full max-w-md rounded-[16px] border border-hairline shadow-xl p-6 sm:p-8 space-y-6">
        <div class="flex items-center justify-between border-b border-hairline pb-4">
          <div>
            <h3 id="edit-wallet-modal-title" class="font-display text-lg font-semibold text-ink">Edit Nama Dompet</h3>
            <p class="text-xs text-slate">Ubah nama identitas dompet Anda.</p>
          </div>
          <button @click="showEditModal = false" type="button" aria-label="Tutup form edit dompet" class="text-slate hover:text-ink p-1 cursor-pointer">✕</button>
        </div>

        <form @submit.prevent="handleEditWallet" class="space-y-4">
          <div>
            <label for="edit-name" class="block font-body text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Nama Dompet
            </label>
            <input 
              id="edit-name"
              v-model="editForm.name"
              type="text"
              placeholder="Masukkan nama dompet baru"
              :disabled="actionLoading"
              class="w-full px-4 py-2.5 bg-canvas text-ink placeholder:text-silver text-sm font-body border border-hairline focus:border-indigo focus:ring-1 focus:ring-indigo rounded-inputs focus:outline-none"
            />
            <p v-if="editFormError" class="mt-1 text-xs text-coral font-body">
              {{ editFormError }}
            </p>
          </div>

          <!-- Disabled Balance Input (Read Only per backend rule) -->
          <div>
            <label class="block font-body text-xs font-semibold text-slate uppercase tracking-wider mb-1.5">
              Saldo Terkini (Read-Only)
            </label>
            <input 
              type="text"
              :value="formatRupiah(editingWallet?.balance || 0)"
              disabled
              class="w-full px-4 py-2.5 bg-paper text-slate text-sm font-mono border border-hairline rounded-inputs opacity-75 cursor-not-allowed"
            />
            <p class="mt-1 text-[11px] text-slate font-body">
              ⚠️ Saldo diatur oleh transaksi dan database trigger backend, tidak diperbolehkan diedit secara manual.
            </p>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button 
              type="button" 
              @click="showEditModal = false"
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
              {{ actionLoading ? 'Memperbarui...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 3: DELETE CONFIRMATION & 409 HANDLING -->
    <div 
      v-if="showDeleteModal" 
      class="fixed inset-0 z-50 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-wallet-modal-title"
      @click.self="showDeleteModal = false"
    >
      <div class="bg-canvas w-full max-w-md rounded-[16px] border border-hairline shadow-xl p-6 sm:p-8 space-y-6">
        <div class="flex items-center justify-between border-b border-hairline pb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-lg bg-coral/10 text-coral flex items-center justify-center font-bold">
              ⚠️
            </div>
            <div>
              <h3 id="delete-wallet-modal-title" class="font-display text-lg font-semibold text-ink">Hapus Dompet</h3>
              <p class="text-xs text-slate">Konfirmasi penghapusan dompet/rekening.</p>
            </div>
          </div>
          <button @click="showDeleteModal = false" type="button" aria-label="Tutup konfirmasi hapus" class="text-slate hover:text-ink p-1 cursor-pointer">✕</button>
        </div>

        <!-- Delete Error Alert (409 Conflict) -->
        <div 
          v-if="deleteErrorMessage"
          class="p-4 bg-coral/10 border border-coral/30 text-coral text-sm rounded-inputs flex items-start gap-3"
        >
          <svg class="w-5 h-5 text-coral shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="flex-1 font-body text-xs leading-relaxed">
            <p class="font-semibold text-sm mb-0.5">Penghapusan Ditolak</p>
            <p>{{ deleteErrorMessage }}</p>
          </div>
        </div>

        <p v-else class="text-sm text-ink leading-relaxed">
          Apakah Anda yakin ingin menghapus dompet <strong class="font-semibold text-indigo">"{{ deletingWallet?.name }}"</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button 
            type="button" 
            @click="showDeleteModal = false"
            :disabled="actionLoading"
            class="py-2.5 px-4 text-slate hover:text-ink font-body text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {{ deleteErrorMessage ? 'Tutup' : 'Batal' }}
          </button>
          <button 
            v-if="!deleteErrorMessage"
            type="button" 
            @click="handleDeleteWallet"
            :disabled="actionLoading"
            class="py-2.5 px-5 bg-coral hover:bg-coral/90 text-canvas font-body text-sm font-semibold rounded-lg transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {{ actionLoading ? 'Menghapus...' : 'Ya, Hapus Dompet' }}
          </button>
        </div>
      </div>
  </div>
</template>
