<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  isOpen?: boolean
}>(), {
  isOpen: false
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:isOpen', value: boolean): void
}>()

const route = useRoute()
const { user, logout } = useAuth()
const isLoggingOut = ref(false)

const userName = computed(() => user.value?.name || 'Pengguna Waletify')
const userEmail = computed(() => user.value?.email || 'user@waletify.com')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())

const navItems = [
  {
    name: 'Overview',
    path: '/dashboard',
    icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
  },
  {
    name: 'Dompet & Rekening',
    path: '/wallets',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
  },
  {
    name: 'Kategori',
    path: '/categories',
    icon: 'M7 7h.01M7 11h.01M7 15h.01M11 7h8M11 11h8M11 15h8'
  },
  {
    name: 'Transaksi',
    path: '/transactions',
    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
  },
  {
    name: 'Hutang & Piutang',
    path: '/debts',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  }
]

function isActive(path: string): boolean {
  if (path === '/dashboard') {
    return route.path === '/dashboard' || route.path === '/'
  }
  return route.path.startsWith(path)
}

function handleClose() {
  emit('close')
  emit('update:isOpen', false)
}

async function handleLogout() {
  if (isLoggingOut.value) return
  isLoggingOut.value = true
  try {
    await logout()
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<template>
  <!-- Main Sidebar Wrapper -->
  <div class="shrink-0 h-full">
    
    <!-- Mobile Sidebar Backdrop Overlay -->
    <Transition
      enter-active-class="transition-opacity ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isOpen" 
        @click="handleClose"
        class="fixed inset-0 bg-ink/40 backdrop-blur-xs z-40 lg:hidden"
        aria-hidden="true"
      ></div>
    </Transition>

    <!-- Meridian Sidebar Aside (Fixed 240px width, 24px padding on all sides, Canvas bg, Hairline border) -->
    <aside 
      :class="[
        'fixed top-0 bottom-0 left-0 z-50 w-[240px] bg-canvas border-r border-hairline flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto lg:h-full lg:w-[240px] shrink-0 p-6',
        isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- Top Section: Logo, Account Pill, Navigation -->
      <div class="flex-1 flex flex-col min-h-0">
        
        <!-- Logo Header & Mobile Close Button -->
        <div class="flex items-center justify-between mb-6 pb-4 border-b border-hairline/80">
          <NuxtLink to="/dashboard" @click="handleClose" class="flex items-center gap-2.5 group">
            <div class="w-8 h-8 bg-indigo rounded-[8px] flex items-center justify-center text-canvas shadow-xs group-hover:scale-105 transition-transform duration-200 shrink-0">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <span class="font-display text-xl font-medium tracking-tight text-ink">
              waletify<span class="text-indigo">.</span>
            </span>
          </NuxtLink>

          <!-- Mobile Close 'X' Button -->
          <button 
            @click="handleClose"
            type="button"
            class="p-1.5 text-slate hover:text-ink hover:bg-paper rounded-[8px] lg:hidden transition-colors cursor-pointer shrink-0"
            aria-label="Tutup Navigasi Mobile"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Account Switcher / Identity Block (Meridian Spec: Paper card, 24px margin bottom) -->
        <div class="mb-6 bg-paper p-3 rounded-[12px] border border-hairline/60 flex items-center justify-between shadow-2xs">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-7 h-7 rounded-full bg-indigo/10 text-indigo flex items-center justify-center text-xs font-semibold font-display shrink-0">
              {{ userInitial }}
            </div>
            <div class="truncate">
              <p class="text-xs font-semibold text-ink truncate leading-tight">{{ userName }}</p>
              <p class="text-[10px] text-slate font-mono truncate leading-tight mt-0.5">{{ userEmail }}</p>
            </div>
          </div>
          <span class="w-2 h-2 rounded-full bg-emerald shrink-0" title="Status: Active Session"></span>
        </div>

        <!-- Sidebar Navigation List (Meridian Spec: 10px Y / 12px X padding, 4px gap between items) -->
        <nav class="space-y-1 overflow-y-auto pr-0.5">
          <NuxtLink 
            v-for="item in navItems"
            :key="item.path"
            :to="item.path" 
            @click="handleClose"
            :class="[
              'flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-xs transition-all duration-200 font-body',
              isActive(item.path)
                ? 'font-semibold bg-paper text-indigo shadow-2xs border border-hairline/40'
                : 'font-medium text-slate hover:text-ink hover:bg-paper/50'
            ]"
          >
            <svg 
              :class="['w-4 h-4 shrink-0 transition-colors', isActive(item.path) ? 'text-indigo' : 'text-slate']" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
            </svg>
            <span class="truncate">{{ item.name }}</span>
          </NuxtLink>
        </nav>
      </div>

      <!-- Bottom Sidebar Action: Logout Button -->
      <div class="pt-4 border-t border-hairline/80 mt-auto shrink-0">
        <button
          @click="handleLogout"
          :disabled="isLoggingOut"
          type="button"
          class="w-full py-2.5 px-3 rounded-[8px] text-xs font-semibold text-coral hover:bg-coral/10 border border-transparent hover:border-coral/20 flex items-center justify-between transition-all duration-200 disabled:opacity-50 cursor-pointer"
        >
          <span class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>{{ isLoggingOut ? 'Keluar...' : 'Keluar Akun' }}</span>
          </span>
          <span class="text-[10px] opacity-60 font-mono">Exit</span>
        </button>
      </div>
    </aside>
  </div>
</template>
