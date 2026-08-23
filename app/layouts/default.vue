<script setup lang="ts">
import { ref, computed } from 'vue'

const route = useRoute()
const isMobileMenuOpen = ref(false)

const headerTitle = computed(() => {
  return (route.meta.title as string) || 'Dashboard Overview'
})
</script>

<template>
  <div class="h-screen w-screen overflow-hidden bg-cloud text-ink font-body flex selection:bg-indigo selection:text-canvas">
    <!-- Reusable Sidebar -->
    <AppSidebar 
      :is-open="isMobileMenuOpen" 
      @close="isMobileMenuOpen = false" 
    />

    <!-- Main Content Shell -->
    <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
      <!-- Layout Header with Action Slot -->
      <slot name="header" :toggle-mobile="() => isMobileMenuOpen = true">
        <AppHeader :title="headerTitle" @toggle-mobile="isMobileMenuOpen = true">
          <slot name="header-action" />
        </AppHeader>
      </slot>

      <!-- Independent Scrollable Main Container -->
      <div class="flex-1 overflow-y-auto min-h-0 flex flex-col">
        <!-- Main Slot Content -->
        <main class="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          <slot />
        </main>

        <!-- Reusable Footer -->
        <footer class="border-t border-hairline px-4 sm:px-8 py-4 text-xs text-slate flex flex-col sm:flex-row justify-between items-center gap-2 bg-canvas mt-auto shrink-0">
          <p>&copy; 2026 Waletify Finance. Hak cipta dilindungi.</p>
          <p class="font-mono text-[11px]">Waletify Personal Finance System</p>
        </footer>
      </div>
    </div>
  </div>
</template>
