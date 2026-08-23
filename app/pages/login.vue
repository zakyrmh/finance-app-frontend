<script setup lang="ts">
import { ref, reactive } from "vue";

// Set page meta (SEO title & description)
useSeoMeta({
  title: "Masuk Akun - Waletify Personal Finance",
  description:
    "Masuk ke akun Waletify Anda untuk memantau dan mengelola dompet serta transaksi keuangan pribadi Anda.",
});

definePageMeta({
  layout: false,
  middleware: 'guest'
});

const { login } = useAuth();

const form = reactive({
  email: "",
  password: "",
});

const showPassword = ref(false);

const loading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

// Field specific error messages for frontend instant feedback
const fieldErrors = reactive({
  email: "",
  password: "",
});

function validateForm(): boolean {
  fieldErrors.email = "";
  fieldErrors.password = "";
  errorMessage.value = "";

  let isValid = true;

  if (!form.email.trim()) {
    fieldErrors.email = "Alamat email wajib diisi";
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    fieldErrors.email = "Format email tidak valid";
    isValid = false;
  }

  if (!form.password) {
    fieldErrors.password = "Password wajib diisi";
    isValid = false;
  }

  return isValid;
}

async function handleLogin() {
  if (!validateForm()) return;

  loading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    await login({
      email: form.email.trim(),
      password: form.password,
    });

    successMessage.value = "Login berhasil! Mengalihkan ke dashboard...";
    await navigateTo("/dashboard");
  } catch (error: any) {
    errorMessage.value =
      error?.data?.error ||
      error?.message ||
      "Login gagal. Periksa kembali email dan password Anda.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-cloud text-ink font-body flex flex-col justify-between selection:bg-indigo selection:text-canvas"
  >
    <!-- Header Section -->
    <header
      class="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between"
    >
      <NuxtLink to="/" class="flex items-center gap-2.5 group">
        <!-- Waletify Wallet Icon -->
        <div
          class="w-9 h-9 bg-indigo rounded-lg flex items-center justify-center text-canvas shadow-sm group-hover:scale-105 transition-transform duration-200"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>
        <span
          class="font-display text-2xl font-semibold tracking-tight text-ink"
        >
          waletify<span class="text-indigo">.</span>
        </span>
      </NuxtLink>

      <div class="flex items-center gap-3">
        <span class="text-body text-slate hidden sm:inline"
          >Belum memiliki akun?</span
        >
        <NuxtLink
          to="/register"
          class="font-body text-sm font-semibold text-indigo hover:text-indigo/80 underline decoration-indigo/30 hover:decoration-indigo underline-offset-4 transition-all"
        >
          Daftar Akun
        </NuxtLink>
      </div>
    </header>

    <!-- Main Content Container -->
    <main
      class="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 flex-1 flex items-center justify-center"
    >
      <div
        class="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
      >
        <!-- Left Column: Login Form Section -->
        <div
          class="lg:col-span-6 xl:col-span-5 flex flex-col justify-center max-w-lg mx-auto lg:max-w-none w-full"
        >
          <div
            class="bg-canvas p-6 sm:p-8 rounded-[16px] border border-hairline shadow-sm"
          >
            <div class="mb-6">
              <div
                class="inline-flex items-center gap-2 px-3 py-1 bg-paper rounded-full mb-3"
              >
                <span class="w-2 h-2 rounded-full bg-emerald"></span>
                <span
                  class="font-body text-xs font-semibold text-slate uppercase tracking-wider"
                  >Akses Akun</span
                >
              </div>

              <h1
                class="font-display text-2xl sm:text-3xl font-semibold text-ink tracking-tight mb-2"
              >
                Selamat Datang Kembali
              </h1>
              <p class="text-slate text-sm leading-relaxed">
                Masukkan kredensial Anda untuk mengakses dashboard keuangan
                Waletify.
              </p>
            </div>

            <!-- Error Alert -->
            <div
              v-if="errorMessage"
              class="mb-5 p-4 bg-coral/10 border border-coral/30 text-coral text-sm rounded-inputs flex items-start gap-3"
            >
              <svg
                class="w-5 h-5 text-coral shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div class="flex-1 font-body">
                <p class="font-semibold">Login Belum Berhasil</p>
                <p class="text-xs opacity-90 mt-0.5">{{ errorMessage }}</p>
              </div>
            </div>

            <!-- Success Alert -->
            <div
              v-if="successMessage"
              class="mb-5 p-4 bg-emerald/10 border border-emerald/30 text-emerald text-sm rounded-inputs flex items-start gap-3"
            >
              <svg
                class="w-5 h-5 text-emerald shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <div class="flex-1 font-body">
                <p class="font-semibold">{{ successMessage }}</p>
              </div>
            </div>

            <!-- Login Form -->
            <form @submit.prevent="handleLogin" class="space-y-4" novalidate>
              <!-- Input Email -->
              <div>
                <label
                  for="email"
                  class="block font-body text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
                >
                  Alamat Email
                </label>
                <div class="relative">
                  <div
                    class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-silver"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.75"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    placeholder="nama@email.com"
                    autocomplete="email"
                    :disabled="loading"
                    :class="[
                      'w-full pl-11 pr-4 py-2.5 bg-canvas text-ink placeholder:text-silver text-sm font-body border rounded-inputs transition-all duration-200 focus:outline-none',
                      fieldErrors.email
                        ? 'border-coral focus:border-coral focus:ring-1 focus:ring-coral'
                        : 'border-hairline focus:border-indigo focus:ring-1 focus:ring-indigo',
                    ]"
                  />
                </div>
                <p
                  v-if="fieldErrors.email"
                  class="mt-1 text-xs text-coral font-body"
                >
                  {{ fieldErrors.email }}
                </p>
              </div>

              <!-- Input Password -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label
                    for="password"
                    class="block font-body text-xs font-semibold text-ink uppercase tracking-wider"
                  >
                    Password
                  </label>
                </div>
                <div class="relative">
                  <div
                    class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-silver"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.75"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    id="password"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Masukkan password Anda"
                    autocomplete="current-password"
                    :disabled="loading"
                    :class="[
                      'w-full pl-11 pr-11 py-2.5 bg-canvas text-ink placeholder:text-silver text-sm font-body border rounded-inputs transition-all duration-200 focus:outline-none',
                      fieldErrors.password
                        ? 'border-coral focus:border-coral focus:ring-1 focus:ring-coral'
                        : 'border-hairline focus:border-indigo focus:ring-1 focus:ring-indigo',
                    ]"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-silver hover:text-ink transition-colors"
                    tabindex="-1"
                    aria-label="Toggle password visibility"
                  >
                    <svg
                      v-if="!showPassword"
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.75"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.75"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <svg
                      v-else
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.75"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a8.96 8.96 0 012.122-.063c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18"
                      />
                    </svg>
                  </button>
                </div>
                <p
                  v-if="fieldErrors.password"
                  class="mt-1 text-xs text-coral font-body"
                >
                  {{ fieldErrors.password }}
                </p>
              </div>

              <!-- Submit Button (Primary Indigo Action: 8px rounded radius) -->
              <button
                type="submit"
                :disabled="loading"
                class="w-full py-3 px-4 bg-indigo hover:bg-indigo/90 text-canvas font-body text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-75 disabled:cursor-not-allowed group cursor-pointer shadow-sm mt-2"
              >
                <template v-if="loading">
                  <svg
                    class="animate-spin h-4 w-4 text-canvas"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Masuk ke akun...</span>
                </template>
                <template v-else>
                  <span>Masuk Ke Dashboard</span>
                  <svg
                    class="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </template>
              </button>
            </form>

            <!-- Security info badge -->
            <div
              class="mt-6 pt-5 border-t border-hairline flex items-center justify-center gap-2 text-xs text-slate"
            >
              <svg
                class="w-4 h-4 text-emerald"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span>Terproteksi otomatis dengan HttpOnly Session Cookie</span>
            </div>
          </div>

          <!-- Secondary Link for Mobile -->
          <div class="mt-6 text-center lg:hidden">
            <p class="text-sm text-slate">
              Belum memiliki akun?
              <NuxtLink
                to="/register"
                class="text-indigo font-semibold hover:underline"
              >
                Daftar akun Waletify
              </NuxtLink>
            </p>
          </div>
        </div>

        <!-- Right Column: Meridian Financial Preview Panel (Desktop & Tablet) -->
        <div
          class="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-between bg-paper p-8 xl:p-10 rounded-[16px] border border-hairline relative"
        >
          <!-- Top Section -->
          <div>
            <div class="flex items-center justify-between mb-6">
              <span
                class="font-display text-xs font-semibold tracking-wider text-slate uppercase"
                >Waletify Financial Observatory</span
              >
              <span
                class="inline-flex items-center gap-1.5 px-3 py-1 bg-canvas rounded-full text-xs font-mono text-ink border border-hairline"
              >
                <span class="w-2 h-2 rounded-full bg-emerald"></span>
                Cookie Auth Active
              </span>
            </div>

            <!-- Balance Summary Card (Meridian Hero Number with Ledger Mono) -->
            <div
              class="bg-canvas p-6 rounded-[16px] border border-hairline mb-6 shadow-sm"
            >
              <div class="flex items-center justify-between mb-2">
                <span
                  class="text-xs font-medium text-slate uppercase tracking-wider"
                  >Ringkasan Finansial Anda</span
                >
                <span
                  class="px-2.5 py-0.5 bg-paper rounded-full text-xs font-mono text-slate"
                  >IDR</span
                >
              </div>

              <div class="mb-4">
                <div
                  class="font-mono text-3xl xl:text-4xl font-medium text-ink tracking-tight"
                >
                  Rp 48.250.000,00
                </div>
                <div
                  class="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald/10 text-emerald rounded-full text-xs font-semibold font-body"
                >
                  <span>▲ 12.4% pertumbuhan dana</span>
                </div>
              </div>

              <!-- Sparkline Indicator / Recent Transactions Preview -->
              <div class="pt-4 border-t border-hairline space-y-3">
                <div
                  class="text-xs font-semibold text-slate uppercase tracking-wider"
                >
                  Aktivitas Terkini
                </div>

                <div
                  class="flex items-center justify-between py-2 border-b border-hairline/60"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 rounded-full bg-emerald/10 text-emerald flex items-center justify-center text-xs font-bold"
                    >
                      ↓
                    </div>
                    <div>
                      <p class="text-sm font-medium text-ink">Pemasukan Gaji</p>
                      <p class="text-xs text-slate">
                        Dompet Utama · Terverifikasi
                      </p>
                    </div>
                  </div>
                  <span class="font-mono text-sm font-medium text-ink"
                    >+Rp 15.000.000,00</span
                  >
                </div>

                <div class="flex items-center justify-between py-2">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 rounded-full bg-coral/10 text-coral flex items-center justify-center text-xs font-bold"
                    >
                      ↑
                    </div>
                    <div>
                      <p class="text-sm font-medium text-ink">
                        Pengeluaran Rutin
                      </p>
                      <p class="text-xs text-slate">
                        Kategori Tagihan · Terverifikasi
                      </p>
                    </div>
                  </div>
                  <span class="font-mono text-sm font-medium text-coral"
                    >-Rp 2.450.000,00</span
                  >
                </div>
              </div>
            </div>

            <!-- Features Checklist Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                class="bg-canvas p-4 rounded-xl border border-hairline flex items-start gap-3"
              >
                <div
                  class="w-7 h-7 rounded-lg bg-indigo/10 text-indigo flex items-center justify-center shrink-0"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-ink">Privasi HttpOnly</p>
                  <p class="text-xs text-slate mt-0.5">
                    Token JWT terproteksi dari skrip pihak ketiga.
                  </p>
                </div>
              </div>

              <div
                class="bg-canvas p-4 rounded-xl border border-hairline flex items-start gap-3"
              >
                <div
                  class="w-7 h-7 rounded-lg bg-indigo/10 text-indigo flex items-center justify-center shrink-0"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-ink">Analisis Laporan</p>
                  <p class="text-xs text-slate mt-0.5">
                    Visibilitas arus kas secara riil dan konsisten.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Quote Section -->
          <div class="pt-6 border-t border-hairline mt-6">
            <blockquote
              class="text-xs sm:text-sm text-slate italic leading-relaxed"
            >
              "Meridian financial clarity — Kejujuran data numerik membawa
              keputusan finansial yang lebih tenang."
            </blockquote>
            <p class="text-xs font-display text-ink mt-2 font-medium">
              — Waletify Personal Finance System
            </p>
          </div>
        </div>
      </div>
    </main>

    <!-- Simple Footer -->
    <footer
      class="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 border-t border-hairline text-xs text-slate flex flex-col sm:flex-row justify-between items-center gap-3"
    >
      <p>&copy; 2026 Waletify Finance. Hak cipta dilindungi.</p>
      <div class="flex items-center gap-6">
        <a href="#" class="hover:text-ink transition-colors">Privasi</a>
        <a href="#" class="hover:text-ink transition-colors"
          >Syarat & Ketentuan</a
        >
        <a href="#" class="hover:text-ink transition-colors">Bantuan</a>
      </div>
    </footer>
  </div>
</template>
