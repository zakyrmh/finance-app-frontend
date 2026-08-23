<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// SEO Meta
useSeoMeta({
  title: 'Dashboard Overview - Waletify Personal Finance',
  description: 'Dashboard utama pencatatan keuangan pribadi Waletify.'
})

// Protected Route Middleware & Title
definePageMeta({
  middleware: 'auth',
  title: 'Dashboard Overview'
})

const { user } = useAuth()
const { wallets, totalBalance, fetchWallets, loading: walletsLoading } = useWallets()
const { transactions, fetchTransactions, loading: transactionsLoading, totalIncomeAmount, totalExpenseAmount } = useTransactions()
const { debts, fetchDebts, loading: debtsLoading, totalReceivableRemaining, totalPayableRemaining } = useDebts()

const userName = computed(() => user.value?.name || 'Pengguna Waletify')

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

// Fetch 5 recent transactions and active data
onMounted(async () => {
  try {
    await Promise.all([
      fetchWallets(1, 20),
      fetchTransactions(1, 10),
      fetchDebts(1, 20)
    ])
  } catch (_) {
    // Handled in composable state
  }
})

const recentTransactions = computed(() => {
  return transactions.value.slice(0, 5)
})

const activeDebts = computed(() => {
  return debts.value.filter(d => d.status === 'active').slice(0, 4)
})
</script>

<template>
  <NuxtLayout>
    <template #header-action>
      <NuxtLink 
        to="/transactions" 
        class="py-2 px-3.5 bg-indigo hover:bg-indigo/90 text-canvas font-body text-xs sm:text-sm font-semibold rounded-buttons transition-all shadow-xs flex items-center gap-2 cursor-pointer"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>+ Catat Transaksi</span>
      </NuxtLink>
    </template>

    <div class="space-y-8 sm:space-y-12">
      
      <!-- Welcome Hero Banner (Canvas Surface, 16px radius, 24px padding, Hairline border) -->
      <div class="bg-canvas p-6 sm:p-8 rounded-cards border border-hairline shadow-xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-paper rounded-pills mb-2 border border-hairline">
              <span class="w-2 h-2 rounded-full bg-emerald"></span>
              <span class="font-body text-xs font-semibold text-slate uppercase tracking-wider">Ikhtisar Real-Time</span>
            </div>
            <h2 class="font-display text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
              Selamat Datang Kembali, {{ userName }}
            </h2>
            <p class="text-sm text-slate font-body mt-1">
              Pantau arus kas, posisi saldo dompet, dan rekapitulasi pinjaman Anda hari ini.
            </p>
          </div>
          <div class="flex items-center gap-2.5">
            <NuxtLink 
              to="/wallets" 
              class="py-2.5 px-4 bg-paper hover:bg-paper/80 text-ink font-body text-xs font-semibold rounded-buttons transition-colors shadow-2xs"
            >
              Kelola Dompet
            </NuxtLink>
            <NuxtLink 
              to="/debts" 
              class="py-2.5 px-4 bg-paper hover:bg-paper/80 text-ink font-body text-xs font-semibold rounded-buttons transition-colors shadow-2xs"
            >
              Lihat Hutang
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Meridian Balance Summary Card & Financial Metric Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Hero Balance Card (7 Cols on desktop) -->
        <div class="lg:col-span-7 bg-canvas p-6 sm:p-8 rounded-cards border border-hairline shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold text-slate uppercase tracking-wider">Konsolidasi Kas (Total Saldo)</span>
              <span class="px-2.5 py-0.5 bg-paper rounded-pills text-xs font-mono text-slate border border-hairline">IDR</span>
            </div>

            <!-- Total Balance (Ledger Mono 36px/40px) -->
            <div class="my-2">
              <div v-if="walletsLoading" class="h-10 bg-paper rounded w-2/3 animate-pulse"></div>
              <div v-else class="font-mono text-3xl sm:text-4xl font-semibold text-ink tracking-tight">
                {{ formatRupiah(totalBalance) }}
              </div>
            </div>

            <!-- Net Indicator Pill -->
            <div class="mt-3 flex flex-wrap items-center gap-3">
              <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald/10 text-emerald rounded-pills text-xs font-semibold font-body">
                <span>▲ {{ wallets.length }} Dompet Aktif Terhubung</span>
              </div>
              <span class="text-xs text-slate font-mono">Diperbarui via DB Triggers</span>
            </div>
          </div>

          <!-- Bottom Micro-breakdown (Income vs Expense) -->
          <div class="mt-8 pt-6 border-t border-hairline grid grid-cols-2 gap-4">
            <div>
              <span class="text-xs font-semibold text-slate uppercase tracking-wider block mb-1">Total Pemasukan</span>
              <span class="font-mono text-base sm:text-lg font-semibold text-emerald">
                +{{ formatRupiah(totalIncomeAmount) }}
              </span>
            </div>
            <div>
              <span class="text-xs font-semibold text-slate uppercase tracking-wider block mb-1">Total Pengeluaran</span>
              <span class="font-mono text-base sm:text-lg font-semibold text-coral">
                -{{ formatRupiah(totalExpenseAmount) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Debt Position Cards (5 Cols on desktop) -->
        <div class="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <!-- Sisa Piutang (Receivables) -->
          <div class="bg-canvas p-6 rounded-cards border border-hairline shadow-xs flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-slate uppercase tracking-wider">Sisa Piutang (Hak Tagih)</span>
              <span class="w-7 h-7 rounded-lg bg-emerald/10 text-emerald flex items-center justify-center text-xs font-bold">📥</span>
            </div>
            <div class="my-1">
              <div v-if="debtsLoading" class="h-8 bg-paper rounded w-1/2 animate-pulse"></div>
              <div v-else class="font-mono text-2xl font-semibold text-emerald tracking-tight">
                {{ formatRupiah(totalReceivableRemaining) }}
              </div>
            </div>
            <p class="text-xs text-slate font-body mt-1">Uang Anda di pihak lain yang belum lunas</p>
          </div>

          <!-- Sisa Hutang (Payables) -->
          <div class="bg-canvas p-6 rounded-cards border border-hairline shadow-xs flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-slate uppercase tracking-wider">Sisa Hutang (Kewajiban)</span>
              <span class="w-7 h-7 rounded-lg bg-coral/10 text-coral flex items-center justify-center text-xs font-bold">📤</span>
            </div>
            <div class="my-1">
              <div v-if="debtsLoading" class="h-8 bg-paper rounded w-1/2 animate-pulse"></div>
              <div v-else class="font-mono text-2xl font-semibold text-coral tracking-tight">
                {{ formatRupiah(totalPayableRemaining) }}
              </div>
            </div>
            <p class="text-xs text-slate font-body mt-1">Kewajiban pembayaran yang harus diselesaikan</p>
          </div>
        </div>

      </div>

      <!-- Feature Navigation Cards Grid (24px padding on every card, 24px grid gap) -->
      <div>
        <div class="mb-4">
          <h3 class="font-display text-lg font-semibold text-ink tracking-tight">
            Menu Akses Cepat
          </h3>
          <p class="text-xs text-slate">Navigasi ke modul manajemen keuangan.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <!-- Card 1: Dompet -->
          <NuxtLink 
            to="/wallets" 
            class="bg-canvas p-6 rounded-cards border border-hairline hover:border-indigo/40 transition-all duration-200 group shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div class="w-10 h-10 rounded-xl bg-indigo/10 text-indigo flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                💳
              </div>
              <h4 class="font-display text-base font-semibold text-ink group-hover:text-indigo transition-colors">
                Dompet & Rekening
              </h4>
              <p class="text-xs text-slate mt-1 leading-relaxed">
                Kelola saldo dompet, akun bank, e-wallet, dan rekening pribadi.
              </p>
            </div>
            <div class="pt-4 mt-4 border-t border-hairline flex items-center justify-between text-xs font-semibold text-indigo">
              <span>{{ wallets.length }} Dompet</span>
              <span class="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </NuxtLink>

          <!-- Card 2: Kategori -->
          <NuxtLink 
            to="/categories" 
            class="bg-canvas p-6 rounded-cards border border-hairline hover:border-emerald/40 transition-all duration-200 group shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div class="w-10 h-10 rounded-xl bg-emerald/10 text-emerald flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                🏷️
              </div>
              <h4 class="font-display text-base font-semibold text-ink group-hover:text-emerald transition-colors">
                Kategori Transaksi
              </h4>
              <p class="text-xs text-slate mt-1 leading-relaxed">
                Atur label pengeluaran & pemasukan untuk klasifikasi kas.
              </p>
            </div>
            <div class="pt-4 mt-4 border-t border-hairline flex items-center justify-between text-xs font-semibold text-emerald">
              <span>Kelola Label</span>
              <span class="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </NuxtLink>

          <!-- Card 3: Transaksi -->
          <NuxtLink 
            to="/transactions" 
            class="bg-canvas p-6 rounded-cards border border-hairline hover:border-indigo/40 transition-all duration-200 group shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div class="w-10 h-10 rounded-xl bg-indigo/10 text-indigo flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                💸
              </div>
              <h4 class="font-display text-base font-semibold text-ink group-hover:text-indigo transition-colors">
                Riwayat Transaksi
              </h4>
              <p class="text-xs text-slate mt-1 leading-relaxed">
                Catat pemasukan, pengeluaran, transfer, dan split bill.
              </p>
            </div>
            <div class="pt-4 mt-4 border-t border-hairline flex items-center justify-between text-xs font-semibold text-indigo">
              <span>{{ transactions.length }} Transaksi</span>
              <span class="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </NuxtLink>

          <!-- Card 4: Hutang & Piutang -->
          <NuxtLink 
            to="/debts" 
            class="bg-canvas p-6 rounded-cards border border-hairline hover:border-coral/40 transition-all duration-200 group shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div class="w-10 h-10 rounded-xl bg-coral/10 text-coral flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                📜
              </div>
              <h4 class="font-display text-base font-semibold text-ink group-hover:text-coral transition-colors">
                Hutang & Piutang
              </h4>
              <p class="text-xs text-slate mt-1 leading-relaxed">
                Pantau pinjaman teman, progres bayar, dan status lunas.
              </p>
            </div>
            <div class="pt-4 mt-4 border-t border-hairline flex items-center justify-between text-xs font-semibold text-coral">
              <span>{{ debts.length }} Catatan</span>
              <span class="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </NuxtLink>

        </div>
      </div>

      <!-- Recent Transactions & Active Debts Split Section -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Recent Transactions Card (7 Cols) -->
        <div class="lg:col-span-7 bg-canvas p-6 sm:p-8 rounded-cards border border-hairline shadow-xs">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-hairline">
            <div>
              <h3 class="font-display text-base font-semibold text-ink tracking-tight">
                Transaksi Terkini
              </h3>
              <p class="text-xs text-slate">5 mutasi kas terakhir.</p>
            </div>
            <NuxtLink 
              to="/transactions" 
              class="text-xs font-semibold text-indigo hover:text-indigo/80 transition-colors"
            >
              Lihat Semua →
            </NuxtLink>
          </div>

          <!-- Loading -->
          <div v-if="transactionsLoading" class="py-8 text-center text-slate text-xs font-mono animate-pulse">
            Memuat transaksi terbaru...
          </div>

          <!-- Empty State -->
          <div v-else-if="recentTransactions.length === 0" class="py-8 text-center text-slate text-sm">
            <p class="font-semibold text-ink mb-1">Belum Ada Transaksi</p>
            <p class="text-xs">Catat pemasukan atau pengeluaran pertama Anda.</p>
          </div>

          <!-- List -->
          <div v-else class="divide-y divide-hairline">
            <div 
              v-for="trx in recentTransactions" 
              :key="trx.id"
              class="py-3 flex items-center justify-between gap-3 hover:bg-paper/40 px-2 rounded-lg transition-colors"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div 
                  :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                    trx.type === 'income' ? 'bg-emerald/10 text-emerald' : 
                    trx.type === 'expense' ? 'bg-coral/10 text-coral' : 'bg-indigo/10 text-indigo'
                  ]"
                >
                  {{ trx.type === 'income' ? '↓' : trx.type === 'expense' ? '↑' : '⇄' }}
                </div>
                <div class="truncate">
                  <p class="text-xs sm:text-sm font-semibold text-ink truncate">
                    {{ trx.description || (trx.type === 'income' ? 'Pemasukan Kas' : trx.type === 'expense' ? 'Pengeluaran Kas' : 'Transfer') }}
                  </p>
                  <p class="text-[11px] text-slate font-mono truncate">
                    {{ trx.reference_code }} · {{ formatDate(trx.created_at) }}
                  </p>
                </div>
              </div>

              <div class="text-right shrink-0">
                <span 
                  :class="[
                    'font-mono text-xs sm:text-sm font-semibold',
                    trx.type === 'income' ? 'text-emerald' : trx.type === 'expense' ? 'text-coral' : 'text-ink'
                  ]"
                >
                  {{ trx.type === 'income' ? '+' : trx.type === 'expense' ? '-' : '' }}{{ formatRupiah(trx.total_amount) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Debts Summary Card (5 Cols) -->
        <div class="lg:col-span-5 bg-canvas p-6 sm:p-8 rounded-cards border border-hairline shadow-xs">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-hairline">
            <div>
              <h3 class="font-display text-base font-semibold text-ink tracking-tight">
                Hutang & Piutang Aktif
              </h3>
              <p class="text-xs text-slate">Catatan yang belum lunas.</p>
            </div>
            <NuxtLink 
              to="/debts" 
              class="text-xs font-semibold text-indigo hover:text-indigo/80 transition-colors"
            >
              Lihat Semua →
            </NuxtLink>
          </div>

          <!-- Loading -->
          <div v-if="debtsLoading" class="py-8 text-center text-slate text-xs font-mono animate-pulse">
            Memuat data pinjaman...
          </div>

          <!-- Empty State -->
          <div v-else-if="activeDebts.length === 0" class="py-8 text-center text-slate text-sm">
            <p class="font-semibold text-ink mb-1">Tidak Ada Tagihan Aktif</p>
            <p class="text-xs">Semua catatan pinjaman sudah lunas atau belum ada data.</p>
          </div>

          <!-- List -->
          <div v-else class="space-y-3">
            <div 
              v-for="debt in activeDebts" 
              :key="debt.id"
              class="p-3 bg-paper rounded-xl border border-hairline flex items-center justify-between gap-3"
            >
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 mb-0.5">
                  <span 
                    :class="[
                      'w-2 h-2 rounded-full',
                      debt.type === 'receivable' ? 'bg-emerald' : 'bg-coral'
                    ]"
                  ></span>
                  <p class="text-xs font-semibold text-ink truncate">{{ debt.counterparty_name }}</p>
                </div>
                <p class="text-[10px] text-slate font-mono">
                  {{ debt.type === 'receivable' ? 'Piutang' : 'Hutang' }} · Bayar: {{ formatRupiah(debt.paid_amount) }}
                </p>
              </div>

              <div class="text-right shrink-0">
                <span class="font-mono text-xs font-semibold text-ink">
                  {{ formatRupiah(Math.max(0, debt.total_amount - debt.paid_amount)) }}
                </span>
                <span class="block text-[10px] text-slate font-mono">sisa</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  </NuxtLayout>
</template>
