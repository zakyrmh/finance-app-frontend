// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api/v1'
    }
  },
  routeRules: {
    '/api/v1/**': {
      proxy: 'http://127.0.0.1:8080/api/v1/**'
    }
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})
