<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
}>(), {
  title: 'Dashboard Overview'
})

const emit = defineEmits<{
  (e: 'toggleMobile'): void
}>()

const { user, logout } = useAuth()
const isLoggingOut = ref(false)

const userName = computed(() => user.value?.name || 'Pengguna Waletify')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())

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
  <!-- Meridian Header Surface: Canvas bg, 1px Hairline bottom border, 72px height -->
  <header class="sticky top-0 z-30 h-18 sm:h-20 bg-canvas border-b border-hairline px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-2xs">
    
    <!-- Title & Mobile Toggle Left Group -->
    <div class="flex items-center gap-3 sm:gap-4 min-w-0">
      <!-- Mobile Hamburger Button -->
      <button 
        @click="emit('toggleMobile')"
        type="button"
        class="p-2 text-slate hover:text-ink hover:bg-paper rounded-[8px] lg:hidden transition-colors cursor-pointer flex items-center justify-center shrink-0 border border-hairline/60"
        aria-label="Buka Navigasi Mobile"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div class="truncate">
        <h1 class="font-display text-lg sm:text-2xl font-medium text-ink tracking-tight truncate">
          {{ title }}
        </h1>
        <p class="text-xs text-slate font-body hidden sm:block">Waletify Personal Finance System</p>
      </div>
    </div>

    <!-- Header Right Actions & Session Group -->
    <div class="flex items-center gap-3 sm:gap-4 shrink-0">
      
      <!-- Custom Page Action Slot (e.g. Primary Indigo CTA Button) -->
      <slot />

      <!-- Active Session Status Pill (Paper surface, Emerald active dot) -->
      <div class="hidden md:flex items-center gap-2 px-3 py-1.5 bg-paper rounded-full text-xs font-mono text-slate border border-hairline">
        <span class="w-2 h-2 rounded-full bg-emerald"></span>
        <span>Session Active</span>
      </div>

      <!-- User Avatar & Quick Exit Link -->
      <div class="flex items-center gap-3 pl-2 sm:pl-3 border-l border-hairline">
        <div 
          class="w-8 h-8 rounded-full bg-indigo text-canvas flex items-center justify-center text-xs font-semibold font-display shadow-xs shrink-0"
          :title="userName"
        >
          {{ userInitial }}
        </div>
        
        <button
          @click="handleLogout"
          :disabled="isLoggingOut"
          type="button"
          class="hidden sm:inline-flex text-xs font-semibold text-slate hover:text-coral transition-colors cursor-pointer font-body"
          title="Logout dari akun"
        >
          {{ isLoggingOut ? 'Keluar...' : 'Logout' }}
        </button>
      </div>

    </div>
  </header>
</template>
