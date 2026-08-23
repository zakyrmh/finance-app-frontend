<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import type { Debt, DebtType, DebtStatus } from '~/types/debt'

// SEO Meta
useSeoMeta({
  title: 'Hutang & Piutang - Waletify Personal Finance',
  description: 'Kelola pencatatan pinjaman teman, hutang pribadi, progres pelunasan, dan status lunas.'
})

// Protected Route Middleware
definePageMeta({
  middleware: 'auth',
  title: 'Hutang & Piutang'
})

const { 
  debts, 
  loading: debtsLoading, 
  payables, 
  receivables, 
  totalReceivableRemaining, 
  totalPayableRemaining, 
  fetchDebts, 
  createDebt, 
  updateDebt, 
  deleteDebt 
} = useDebts()

const activeTypeTab = ref<'all' | 'receivable' | 'payable'>('all')
const activeStatusFilter = ref<'all' | 'active' | 'paid_off'>('all')

// Modals State
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

// Active Targets
const editingDebt = ref<Debt | null>(null)
const deletingDebt = ref<Debt | null>(null)

// Forms State
const createForm = reactive({
  counterparty_name: '',
  type: 'receivable' as DebtType,
  total_amount: 0
})
const createFormError = ref('')

const editForm = reactive({
  counterparty_name: '',
  total_amount: 0
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

// Calculate Progress Percentage
function getProgressPercentage(debt: Debt): number {
  if (!debt.total_amount || debt.total_amount <= 0) return 0
  const pct = ((debt.paid_amount || 0) / debt.total_amount) * 100
  return Math.min(100, Math.max(0, Math.round(pct)))
}

// Filtered List
const displayedDebts = computed(() => {
  let list = debts.value

  // Type Filter
  if (activeTypeTab.value === 'receivable') {
    list = list.filter(d => d.type === 'receivable')
  } else if (activeTypeTab.value === 'payable') {
    list = list.filter(d => d.type === 'payable')
  }

  // Status Filter
  if (activeStatusFilter.value === 'active') {
    list = list.filter(d => d.status === 'active')
  } else if (activeStatusFilter.value === 'paid_off') {
    list = list.filter(d => d.status === 'paid_off')
  }

  return list
})

const paidOffCount = computed(() => {
  return debts.value.filter(d => d.status === 'paid_off').length
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
    await fetchDebts()
  } catch (_) {
    // Handled by composable state
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// Handlers
function openCreateModal(defaultType: DebtType = 'receivable') {
  createForm.counterparty_name = ''
  createForm.type = defaultType
  createForm.total_amount = 0
  createFormError.value = ''
  showCreateModal.value = true
}

async function handleCreateDebt() {
  createFormError.value = ''
  if (!createForm.counterparty_name.trim()) {
    createFormError.value = 'Nama pihak/teman wajib diisi'
    return
  }
  if (!createForm.total_amount || createForm.total_amount <= 0) {
    createFormError.value = 'Total nominal harus lebih dari 0'
    return
  }

  actionLoading.value = true
  try {
    await createDebt({
      counterparty_name: createForm.counterparty_name.trim(),
      type: createForm.type,
      total_amount: Number(createForm.total_amount)
    })
    showCreateModal.value = false
    createForm.counterparty_name = ''
    createForm.total_amount = 0
  } catch (err: any) {
    createFormError.value = err?.data?.error || err?.message || 'Gagal mencatat hutang/piutang baru'
  } finally {
    actionLoading.value = false
  }
}

function openEditModal(debt: Debt) {
  if (debt.status === 'paid_off') return
  editingDebt.value = debt
  editForm.counterparty_name = debt.counterparty_name
  editForm.total_amount = debt.total_amount
  editFormError.value = ''
  showEditModal.value = true
}

async function handleEditDebt() {
  if (!editingDebt.value) return
  editFormError.value = ''
  if (!editForm.counterparty_name.trim()) {
    editFormError.value = 'Nama pihak/teman wajib diisi'
    return
  }
  if (!editForm.total_amount || editForm.total_amount <= 0) {
    editFormError.value = 'Total nominal harus lebih dari 0'
    return
  }

  actionLoading.value = true
  try {
    await updateDebt(editingDebt.value.id, {
      counterparty_name: editForm.counterparty_name.trim(),
      total_amount: Number(editForm.total_amount)
    })
    showEditModal.value = false
    editingDebt.value = null
  } catch (err: any) {
    editFormError.value = err?.data?.error || err?.message || 'Gagal memperbarui catatan'
  } finally {
    actionLoading.value = false
  }
}

function openDeleteModal(debt: Debt) {
  deletingDebt.value = debt
  deleteErrorMessage.value = ''
  showDeleteModal.value = true
}

async function handleDeleteDebt() {
  if (!deletingDebt.value) return
  deleteErrorMessage.value = ''
  actionLoading.value = true

  try {
    await deleteDebt(deletingDebt.value.id)
    showDeleteModal.value = false
    deletingDebt.value = null
  } catch (err: any) {
    if (err?.status === 409 || err?.statusCode === 409 || err?.response?.status === 409) {
      deleteErrorMessage.value = 'Data tidak dapat dihapus karena sudah memiliki riwayat transaksi terhubung.'
    } else {
      deleteErrorMessage.value = err?.data?.error || err?.message || 'Gagal menghapus catatan.'
    }
  } finally {
    actionLoading.value = false
  }
}
</script>

<template>
  <NuxtLayout>
    <template #header-action>
      <button 
        @click="openCreateModal('receivable')"
        class="py-2 px-3.5 bg-indigo hover:bg-indigo/90 text-canvas font-body text-xs sm:text-sm font-semibold rounded-buttons transition-all shadow-xs flex items-center gap-2 cursor-pointer"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Catat Pinjaman</span>
      </button>
    </template>

    <div class="space-y-8">
          
          <!-- Summary Metric Cards Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Total Receivables Card (Hak Tagih kita - Emerald/Indigo) -->
            <div class="bg-canvas p-6 rounded-[16px] border border-hairline shadow-xs">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-slate uppercase tracking-wider">Sisa Piutang Saya</span>
                <span class="w-7 h-7 rounded-lg bg-emerald/10 text-emerald flex items-center justify-center text-xs font-bold">📥</span>
              </div>
              <div class="font-mono text-2.5xl sm:text-3xl font-semibold text-emerald tracking-tight">
                {{ formatRupiah(totalReceivableRemaining) }}
              </div>
              <p class="text-xs text-slate mt-1.5">Hak tagih ke teman/pihak lain</p>
            </div>

            <!-- Total Payables Card (Kewajiban bayar kita - Coral) -->
            <div class="bg-canvas p-6 rounded-[16px] border border-hairline shadow-xs">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-slate uppercase tracking-wider">Sisa Hutang Saya</span>
                <span class="w-7 h-7 rounded-lg bg-coral/10 text-coral flex items-center justify-center text-xs font-bold">📤</span>
              </div>
              <div class="font-mono text-2.5xl sm:text-3xl font-semibold text-coral tracking-tight">
                {{ formatRupiah(totalPayableRemaining) }}
              </div>
              <p class="text-xs text-slate mt-1.5">Kewajiban bayar saya ke orang lain</p>
            </div>

            <!-- Paid Off Summary Card -->
            <div class="bg-canvas p-6 rounded-[16px] border border-hairline shadow-xs">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-slate uppercase tracking-wider">Catatan Lunas</span>
                <span class="w-7 h-7 rounded-lg bg-paper border border-hairline text-ink flex items-center justify-center text-xs font-bold">✅</span>
              </div>
              <div class="font-mono text-2.5xl sm:text-3xl font-semibold text-ink tracking-tight">
                {{ paidOffCount }}
              </div>
              <p class="text-xs text-slate mt-1.5">Record status paid_off</p>
            </div>
          </div>

          <!-- Main Debts Container -->
          <div class="bg-canvas p-6 sm:p-8 rounded-[16px] border border-hairline shadow-xs space-y-6">
            
            <!-- Header & Tab Filters -->
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-hairline">
              <div>
                <h3 class="font-display text-lg font-semibold text-ink tracking-tight">
                  Daftar Catatan Pinjaman
                </h3>
                <p class="text-xs text-slate mt-0.5">
                  Pantau progres pelunasan, sisa tagihan, dan status lunas per kontak.
                </p>
              </div>

              <!-- Double Filter Controls -->
              <div class="flex flex-wrap items-center gap-3">
                <!-- Type Switcher -->
                <div class="inline-flex bg-paper p-1 rounded-xl border border-hairline">
                  <button 
                    @click="activeTypeTab = 'all'"
                    :class="[
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                      activeTypeTab === 'all' 
                        ? 'bg-canvas text-ink shadow-2xs border border-hairline/60' 
                        : 'text-slate hover:text-ink'
                    ]"
                  >
                    Semua ({{ debts.length }})
                  </button>

                  <button 
                    @click="activeTypeTab = 'receivable'"
                    :class="[
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1',
                      activeTypeTab === 'receivable' 
                        ? 'bg-canvas text-emerald shadow-2xs border border-hairline/60' 
                        : 'text-slate hover:text-emerald'
                    ]"
                  >
                    <span>Piutang</span>
                    <span class="font-mono text-[11px]">({{ receivables.length }})</span>
                  </button>

                  <button 
                    @click="activeTypeTab = 'payable'"
                    :class="[
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1',
                      activeTypeTab === 'payable' 
                        ? 'bg-canvas text-coral shadow-2xs border border-hairline/60' 
                        : 'text-slate hover:text-coral'
                    ]"
                  >
                    <span>Hutang</span>
                    <span class="font-mono text-[11px]">({{ payables.length }})</span>
                  </button>
                </div>

                <!-- Status Dropdown Filter -->
                <div class="inline-flex bg-paper p-1 rounded-xl border border-hairline">
                  <button 
                    @click="activeStatusFilter = 'all'"
                    :class="[
                      'px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                      activeStatusFilter === 'all' ? 'bg-canvas text-ink shadow-2xs' : 'text-slate'
                    ]"
                  >
                    Semua Status
                  </button>
                  <button 
                    @click="activeStatusFilter = 'active'"
                    :class="[
                      'px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                      activeStatusFilter === 'active' ? 'bg-canvas text-indigo shadow-2xs' : 'text-slate'
                    ]"
                  >
                    Aktif
                  </button>
                  <button 
                    @click="activeStatusFilter = 'paid_off'"
                    :class="[
                      'px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                      activeStatusFilter === 'paid_off' ? 'bg-canvas text-emerald shadow-2xs' : 'text-slate'
                    ]"
                  >
                    Lunas
                  </button>
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="debtsLoading" class="py-12 text-center text-slate text-sm font-mono animate-pulse">
              Memuat daftar pinjaman...
            </div>

            <!-- Empty State -->
            <div 
              v-else-if="displayedDebts.length === 0" 
              class="py-12 text-center text-slate text-sm flex flex-col items-center justify-center"
            >
              <div class="w-14 h-14 bg-paper rounded-2xl flex items-center justify-center text-slate mb-3 border border-hairline">
                📜
              </div>
              <h4 class="font-display text-base font-semibold text-ink mb-1">Belum Ada Catatan Pinjaman</h4>
              <p class="text-xs text-slate max-w-sm mb-4">
                Catat piutang yang Anda berikan ke teman atau hutang pribadi Anda.
              </p>
              <button 
                @click="openCreateModal('receivable')"
                class="py-2 px-4 bg-indigo hover:bg-indigo/90 text-canvas font-body text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                + Catat Pinjaman Pertama
              </button>
            </div>

            <!-- Debts Cards Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                v-for="debt in displayedDebts" 
                :key="debt.id"
                class="bg-canvas p-6 rounded-[16px] border border-hairline hover:border-slate/40 transition-all duration-200 flex flex-col justify-between shadow-2xs group space-y-4"
              >
                <!-- Card Header Info -->
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2.5 min-w-0">
                      <div 
                        :class="[
                          'w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0',
                          debt.type === 'receivable' ? 'bg-emerald/10 text-emerald' : 'bg-coral/10 text-coral'
                        ]"
                      >
                        {{ debt.type === 'receivable' ? '📥' : '📤' }}
                      </div>
                      <div class="truncate">
                        <h4 class="font-display text-base font-semibold text-ink tracking-tight truncate" :title="debt.counterparty_name">
                          {{ debt.counterparty_name }}
                        </h4>
                        <p class="text-[11px] text-slate font-mono">
                          {{ debt.type === 'receivable' ? 'Piutang (Hak Tagih)' : 'Hutang (Kewajiban)' }}
                        </p>
                      </div>
                    </div>

                    <!-- Status Badge -->
                    <div class="flex items-center gap-1.5 shrink-0">
                      <span 
                        :class="[
                          'text-xs font-semibold px-2.5 py-1 rounded-full font-mono',
                          debt.status === 'paid_off' 
                            ? 'bg-emerald/10 text-emerald border border-emerald/20' 
                            : 'bg-indigo/10 text-indigo border border-indigo/20'
                        ]"
                      >
                        {{ debt.status === 'paid_off' ? '✓ LUNAS' : 'AKTIF' }}
                      </span>
                    </div>
                  </div>

                  <!-- Figures Breakdown (IBM Plex Mono) -->
                  <div class="bg-paper p-4 rounded-xl border border-hairline/80 space-y-2 my-3">
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-slate">Total Pinjaman:</span>
                      <span class="font-mono font-semibold text-ink">{{ formatRupiah(debt.total_amount) }}</span>
                    </div>

                    <div class="flex items-center justify-between text-xs">
                      <span class="text-slate">Sudah Terbayar:</span>
                      <span class="font-mono font-semibold text-emerald">{{ formatRupiah(debt.paid_amount) }}</span>
                    </div>

                    <div class="flex items-center justify-between text-xs pt-2 border-t border-hairline/60">
                      <span class="font-semibold text-ink">Sisa Belum Lunas:</span>
                      <span class="font-mono font-semibold text-coral text-sm">
                        {{ formatRupiah(Math.max(0, debt.total_amount - debt.paid_amount)) }}
                      </span>
                    </div>
                  </div>

                  <!-- Visual Payment Progress Bar -->
                  <div>
                    <div class="flex items-center justify-between text-xs mb-1.5 font-mono">
                      <span class="text-slate">Progres Pelunasan:</span>
                      <span class="font-semibold text-ink">{{ getProgressPercentage(debt) }}%</span>
                    </div>
                    <div class="w-full bg-paper h-2 rounded-full overflow-hidden border border-hairline/60">
                      <div 
                        :class="[
                          'h-full transition-all duration-300 rounded-full',
                          debt.status === 'paid_off' ? 'bg-emerald' : 'bg-indigo'
                        ]"
                        :style="{ width: `${getProgressPercentage(debt)}%` }"
                      ></div>
                    </div>
                  </div>
                </div>

                <!-- Card Bottom Actions -->
                <div class="pt-3 border-t border-hairline flex items-center justify-between text-xs">
                  <span class="text-slate font-mono text-[11px]">Dicatat: {{ formatDate(debt.created_at) }}</span>

                  <div class="flex items-center gap-2">
                    <!-- Edit Button (Active Only) -->
                    <button 
                      v-if="debt.status === 'active'"
                      @click="openEditModal(debt)"
                      class="p-1.5 text-slate hover:text-indigo rounded-lg hover:bg-paper transition-colors cursor-pointer"
                      title="Edit Catatan Pinjaman"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <!-- Delete Button -->
                    <button 
                      @click="openDeleteModal(debt)"
                      class="p-1.5 text-slate hover:text-coral rounded-lg hover:bg-coral/10 transition-colors cursor-pointer"
                      title="Hapus Catatan"
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

    </div>
  </NuxtLayout>

    <!-- MODAL 1: CREATE DEBT RECORD -->
    <div 
      v-if="showCreateModal" 
      class="fixed inset-0 z-50 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-debt-modal-title"
      @click.self="showCreateModal = false"
    >
      <div class="bg-canvas w-full max-w-md rounded-[16px] border border-hairline shadow-xl p-6 sm:p-8 space-y-6">
        <div class="flex items-center justify-between border-b border-hairline pb-4">
          <div>
            <h3 id="create-debt-modal-title" class="font-display text-lg font-semibold text-ink">Catat Pinjaman Baru</h3>
            <p class="text-xs text-slate">Tambahkan catatan hutang atau piutang baru.</p>
          </div>
          <button @click="showCreateModal = false" type="button" aria-label="Tutup form buat pinjaman" class="text-slate hover:text-ink p-1 cursor-pointer">✕</button>
        </div>

        <form @submit.prevent="handleCreateDebt" class="space-y-4">
          <!-- Type Segmented Selector -->
          <div>
            <label class="block font-body text-xs font-semibold text-ink uppercase tracking-wider mb-2">
              Jenis Pinjaman
            </label>
            <div class="grid grid-cols-2 gap-2 bg-paper p-1.5 rounded-xl border border-hairline">
              <button 
                type="button"
                @click="createForm.type = 'receivable'"
                :class="[
                  'py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                  createForm.type === 'receivable' 
                    ? 'bg-canvas text-emerald shadow-2xs border border-emerald/30' 
                    : 'text-slate hover:text-ink'
                ]"
              >
                <span>📥 Piutang (Tagih)</span>
              </button>

              <button 
                type="button"
                @click="createForm.type = 'payable'"
                :class="[
                  'py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                  createForm.type === 'payable' 
                    ? 'bg-canvas text-coral shadow-2xs border border-coral/30' 
                    : 'text-slate hover:text-ink'
                ]"
              >
                <span>📤 Hutang (Bayar)</span>
              </button>
            </div>
            <p class="mt-1 text-[11px] text-slate font-body">
              {{ createForm.type === 'receivable' ? 'Pilih ini jika orang lain meminjam uang dari Anda.' : 'Pilih ini jika Anda meminjam uang dari pihak lain.' }}
            </p>
          </div>

          <!-- Counterparty Name -->
          <div>
            <label for="create-counterparty" class="block font-body text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Nama Teman / Pihak Terkait
            </label>
            <input 
              id="create-counterparty"
              v-model="createForm.counterparty_name"
              type="text"
              placeholder="Contoh: Budi Santoso, Toko Alat, dll."
              :disabled="actionLoading"
              class="w-full px-4 py-2.5 bg-canvas text-ink placeholder:text-silver text-sm font-body border border-hairline focus:border-indigo focus:ring-1 focus:ring-indigo rounded-inputs focus:outline-none"
            />
          </div>

          <!-- Total Amount -->
          <div>
            <label for="create-amount" class="block font-body text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Total Nominal Pinjaman (IDR)
            </label>
            <input 
              id="create-amount"
              v-model.number="createForm.total_amount"
              type="number"
              min="1"
              placeholder="0"
              :disabled="actionLoading"
              class="w-full px-4 py-2.5 bg-canvas text-ink placeholder:text-silver text-sm font-mono border border-hairline focus:border-indigo focus:ring-1 focus:ring-indigo rounded-inputs focus:outline-none"
            />
          </div>

          <p v-if="createFormError" class="text-xs text-coral font-body">
            {{ createFormError }}
          </p>

          <div class="flex items-center justify-end gap-3 pt-2 border-t border-hairline">
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
              {{ actionLoading ? 'Menyimpan...' : 'Simpan Catatan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 2: EDIT DEBT RECORD -->
    <div 
      v-if="showEditModal" 
      class="fixed inset-0 z-50 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-debt-modal-title"
      @click.self="showEditModal = false"
    >
      <div class="bg-canvas w-full max-w-md rounded-[16px] border border-hairline shadow-xl p-6 sm:p-8 space-y-6">
        <div class="flex items-center justify-between border-b border-hairline pb-4">
          <div>
            <h3 id="edit-debt-modal-title" class="font-display text-lg font-semibold text-ink">Edit Catatan Pinjaman</h3>
            <p class="text-xs text-slate">Ubah nama kontak atau nominal total.</p>
          </div>
          <button @click="showEditModal = false" type="button" aria-label="Tutup form edit pinjaman" class="text-slate hover:text-ink p-1 cursor-pointer">✕</button>
        </div>

        <form @submit.prevent="handleEditDebt" class="space-y-4">
          <!-- Counterparty Name -->
          <div>
            <label for="edit-counterparty" class="block font-body text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Nama Teman / Pihak Terkait
            </label>
            <input 
              id="edit-counterparty"
              v-model="editForm.counterparty_name"
              type="text"
              placeholder="Masukkan nama kontak"
              :disabled="actionLoading"
              class="w-full px-4 py-2.5 bg-canvas text-ink placeholder:text-silver text-sm font-body border border-hairline focus:border-indigo focus:ring-1 focus:ring-indigo rounded-inputs focus:outline-none"
            />
          </div>

          <!-- Total Amount -->
          <div>
            <label for="edit-amount" class="block font-body text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Total Nominal Pinjaman (IDR)
            </label>
            <input 
              id="edit-amount"
              v-model.number="editForm.total_amount"
              type="number"
              min="1"
              placeholder="0"
              :disabled="actionLoading"
              class="w-full px-4 py-2.5 bg-canvas text-ink placeholder:text-silver text-sm font-mono border border-hairline focus:border-indigo focus:ring-1 focus:ring-indigo rounded-inputs focus:outline-none"
            />
          </div>

          <p v-if="editFormError" class="text-xs text-coral font-body">
            {{ editFormError }}
          </p>

          <div class="p-3 bg-paper rounded-xl border border-hairline text-xs text-slate">
            ⚠️ Status pelunasan dan `paid_amount` diperbarui otomatis dari pencatatan transaksi pembayaran backend.
          </div>

          <div class="flex items-center justify-end gap-3 pt-2 border-t border-hairline">
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
      aria-labelledby="delete-debt-modal-title"
      @click.self="showDeleteModal = false"
    >
      <div class="bg-canvas w-full max-w-md rounded-[16px] border border-hairline shadow-xl p-6 sm:p-8 space-y-6">
        <div class="flex items-center justify-between border-b border-hairline pb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-lg bg-coral/10 text-coral flex items-center justify-center font-bold">
              ⚠️
            </div>
            <div>
              <h3 id="delete-debt-modal-title" class="font-display text-lg font-semibold text-ink">Hapus Catatan</h3>
              <p class="text-xs text-slate">Konfirmasi penghapusan catatan pinjaman.</p>
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
          Apakah Anda yakin ingin menghapus catatan pinjaman dengan <strong class="font-semibold text-indigo">"{{ deletingDebt?.counterparty_name }}"</strong> sebesar {{ formatRupiah(deletingDebt?.total_amount || 0) }}?
        </p>

        <div class="flex items-center justify-end gap-3 pt-2 border-t border-hairline">
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
            @click="handleDeleteDebt"
            :disabled="actionLoading"
            class="py-2.5 px-5 bg-coral hover:bg-coral/90 text-canvas font-body text-sm font-semibold rounded-lg transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {{ actionLoading ? 'Menghapus...' : 'Ya, Hapus Catatan' }}
          </button>
        </div>
      </div>
    </div>
</template>
