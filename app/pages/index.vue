<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: [
    async () => {
      const api = useApi()
      try {
        await api('/wallets?limit=1')
        return navigateTo('/dashboard')
      } catch (_) {
        return navigateTo('/login')
      }
    }
  ]
})
</script>

<template>
  <div />
</template>
