<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import type { Category, CategoryType } from '~/types/category'

// SEO Meta
useSeoMeta({
  title: 'Manajemen Kategori - Waletify Personal Finance',
  description: 'Kelola kategori pemasukan dan pengeluaran transaksi keuangan pribadi Anda.'
})

// Protected Route Middleware
definePageMeta({
  middleware: 'auth',
  title: 'Manajemen Kategori'
})

const { 
  categories, 
  loading: categoriesLoading, 
  incomeCategories, 
  expenseCategories, 
  fetchCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} = useCategories()

const activeTab = ref<'all' | 'income' | 'expense'>('all')

// Modals State
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

// Active Targets
const editingCategory = ref<Category | null>(null)
const deletingCategory = ref<Category | null>(null)

// Forms State
const createForm = reactive({
  name: '',
  type: 'expense' as CategoryType
})
const createFormError = ref('')

const editForm = reactive({
  name: ''
})
const editFormError = ref('')

const actionLoading = ref(false)
const deleteErrorMessage = ref('')

// Filtered List
const displayedCategories = computed(() => {
  if (activeTab.value === 'income') {
    return incomeCategories.value
  }
  if (activeTab.value === 'expense') {
    return expenseCategories.value
  }
  return categories.value
})

function formatDate(dateString: string): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

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
    await fetchCategories()
  } catch (_) {
    // Handled by composable state
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// Handlers
function openCreateModal(defaultType: CategoryType = 'expense') {
  createForm.name = ''
  createForm.type = defaultType
  createFormError.value = ''
  showCreateModal.value = true
}

async function handleCreateCategory() {
  createFormError.value = ''
  if (!createForm.name.trim()) {
    createFormError.value = 'Nama kategori wajib diisi'
    return
  }

  actionLoading.value = true
  try {
    await createCategory({
      name: createForm.name.trim(),
      type: createForm.type
    })
    showCreateModal.value = false
    createForm.name = ''
  } catch (err: any) {
    createFormError.value = err?.data?.error || err?.message || 'Gagal menambahkan kategori baru'
  } finally {
    actionLoading.value = false
  }
}

function openEditModal(category: Category) {
  editingCategory.value = category
  editForm.name = category.name
  editFormError.value = ''
  showEditModal.value = true
}

async function handleEditCategory() {
  if (!editingCategory.value) return
  editFormError.value = ''
  if (!editForm.name.trim()) {
    editFormError.value = 'Nama kategori wajib diisi'
    return
  }

  actionLoading.value = true
  try {
    await updateCategory(editingCategory.value.id, { name: editForm.name.trim() })
    showEditModal.value = false
    editingCategory.value = null
  } catch (err: any) {
    editFormError.value = err?.data?.error || err?.message || 'Gagal mengedit nama kategori'
  } finally {
    actionLoading.value = false
  }
}

function openDeleteModal(category: Category) {
  deletingCategory.value = category
  deleteErrorMessage.value = ''
  showDeleteModal.value = true
}

async function handleDeleteCategory() {
  if (!deletingCategory.value) return
  deleteErrorMessage.value = ''
  actionLoading.value = true

  try {
    await deleteCategory(deletingCategory.value.id)
    showDeleteModal.value = false
    deletingCategory.value = null
  } catch (err: any) {
    if (err?.status === 409 || err?.statusCode === 409 || err?.response?.status === 409) {
      deleteErrorMessage.value = 'Kategori tidak dapat dihapus karena sedang digunakan pada transaksi.'
    } else {
      deleteErrorMessage.value = err?.data?.error || err?.message || 'Gagal menghapus kategori.'
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
        @click="openCreateModal('expense')"
        class="py-2 px-3.5 bg-indigo hover:bg-indigo/90 text-canvas font-body text-xs sm:text-sm font-semibold rounded-buttons transition-all shadow-xs flex items-center gap-2 cursor-pointer"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Tambah Kategori</span>
      </button>
    </template>

    <div class="space-y-8">
          
          <!-- Summary Metric Cards Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Total Categories Card -->
            <div class="bg-canvas p-6 rounded-[16px] border border-hairline shadow-xs">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-slate uppercase tracking-wider">Total Kategori</span>
                <span class="w-7 h-7 rounded-lg bg-indigo/10 text-indigo flex items-center justify-center text-xs font-semibold">🏷️</span>
              </div>
              <div class="font-mono text-3xl font-semibold text-ink">
                {{ categories.length }}
              </div>
              <p class="text-xs text-slate mt-1.5">Label dikelola</p>
            </div>

            <!-- Income Categories Card (Emerald Accent) -->
            <div class="bg-canvas p-6 rounded-[16px] border border-hairline shadow-xs">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-slate uppercase tracking-wider">Kategori Pemasukan</span>
                <span class="w-7 h-7 rounded-lg bg-emerald/10 text-emerald flex items-center justify-center text-xs font-bold">↓</span>
              </div>
              <div class="font-mono text-3xl font-semibold text-emerald">
                {{ incomeCategories.length }}
              </div>
              <p class="text-xs text-slate mt-1.5">Kategori Income</p>
            </div>

            <!-- Expense Categories Card (Coral Accent) -->
            <div class="bg-canvas p-6 rounded-[16px] border border-hairline shadow-xs">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-slate uppercase tracking-wider">Kategori Pengeluaran</span>
                <span class="w-7 h-7 rounded-lg bg-coral/10 text-coral flex items-center justify-center text-xs font-bold">↑</span>
              </div>
              <div class="font-mono text-3xl font-semibold text-coral">
                {{ expenseCategories.length }}
              </div>
              <p class="text-xs text-slate mt-1.5">Kategori Expense</p>
            </div>
          </div>

          <!-- Main Categories Container -->
          <div class="bg-canvas p-6 sm:p-8 rounded-[16px] border border-hairline shadow-xs space-y-6">
            
            <!-- Header & Tab Switcher Filter -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
              <div>
                <h3 class="font-display text-lg font-semibold text-ink tracking-tight">
                  Daftar Kategori Transaksi
                </h3>
                <p class="text-xs text-slate mt-0.5">
                  Kelola nama label untuk mengelompokkan pemasukan dan pengeluaran kas.
                </p>
              </div>

              <!-- Tab Switcher -->
              <div class="inline-flex bg-paper p-1 rounded-xl border border-hairline self-start sm:self-auto">
                <button 
                  @click="activeTab = 'all'"
                  :class="[
                    'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                    activeTab === 'all' 
                      ? 'bg-canvas text-ink shadow-2xs border border-hairline/60' 
                      : 'text-slate hover:text-ink'
                  ]"
                >
                  Semua ({{ categories.length }})
                </button>

                <button 
                  @click="activeTab = 'income'"
                  :class="[
                    'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                    activeTab === 'income' 
                      ? 'bg-canvas text-emerald shadow-2xs border border-hairline/60' 
                      : 'text-slate hover:text-emerald'
                  ]"
                >
                  <span>↓ Pemasukan</span>
                  <span class="font-mono text-[11px]">({{ incomeCategories.length }})</span>
                </button>

                <button 
                  @click="activeTab = 'expense'"
                  :class="[
                    'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                    activeTab === 'expense' 
                      ? 'bg-canvas text-coral shadow-2xs border border-hairline/60' 
                      : 'text-slate hover:text-coral'
                  ]"
                >
                  <span>↑ Pengeluaran</span>
                  <span class="font-mono text-[11px]">({{ expenseCategories.length }})</span>
                </button>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="categoriesLoading" class="py-12 text-center text-slate text-sm font-mono animate-pulse">
              Memuat daftar kategori...
            </div>

            <!-- Empty Categories State -->
            <div 
              v-else-if="displayedCategories.length === 0" 
              class="py-12 text-center text-slate text-sm flex flex-col items-center justify-center"
            >
              <div class="w-14 h-14 bg-paper rounded-2xl flex items-center justify-center text-slate mb-3 border border-hairline">
                🏷️
              </div>
              <h4 class="font-display text-base font-semibold text-ink mb-1">Belum Ada Kategori {{ activeTab !== 'all' ? (activeTab === 'income' ? 'Pemasukan' : 'Pengeluaran') : '' }}</h4>
              <p class="text-xs text-slate max-w-sm mb-4">
                Tambahkan label kategori baru untuk mengelompokkan transaksi Anda.
              </p>
              <button 
                @click="openCreateModal(activeTab === 'income' ? 'income' : 'expense')"
                class="py-2 px-4 bg-indigo hover:bg-indigo/90 text-canvas font-body text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                + Tambah Kategori {{ activeTab === 'income' ? 'Pemasukan' : 'Pengeluaran' }}
              </button>
            </div>

            <!-- Category Grid List -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div 
                v-for="category in displayedCategories" 
                :key="category.id"
                class="bg-canvas p-5 rounded-[16px] border border-hairline hover:border-slate/40 transition-all duration-200 flex items-center justify-between shadow-2xs group"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <!-- Type Badge Icon -->
                  <div 
                    :class="[
                      'w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0',
                      category.type === 'income' ? 'bg-emerald/10 text-emerald' : 'bg-coral/10 text-coral'
                    ]"
                  >
                    {{ category.type === 'income' ? '↓' : '↑' }}
                  </div>

                  <div class="truncate">
                    <h4 class="font-display text-sm font-semibold text-ink tracking-tight truncate" :title="category.name">
                      {{ category.name }}
                    </h4>
                    <div class="flex items-center gap-2 mt-0.5">
                      <span 
                        :class="[
                          'text-[10px] font-semibold font-mono uppercase px-2 py-0.5 rounded-full',
                          category.type === 'income' ? 'bg-emerald/10 text-emerald' : 'bg-coral/10 text-coral'
                        ]"
                      >
                        {{ category.type }}
                      </span>
                      <span class="text-[11px] text-slate font-mono">{{ formatDate(category.created_at) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Actions Buttons -->
                <div class="flex items-center gap-1.5 shrink-0">
                  <button 
                    @click="openEditModal(category)"
                    class="p-1.5 text-slate hover:text-indigo rounded-lg hover:bg-paper transition-colors cursor-pointer"
                    title="Edit Nama Kategori"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <button 
                    @click="openDeleteModal(category)"
                    class="p-1.5 text-slate hover:text-coral rounded-lg hover:bg-coral/10 transition-colors cursor-pointer"
                    title="Hapus Kategori"
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
  </NuxtLayout>

    <!-- MODAL 1: CREATE CATEGORY -->
    <div 
      v-if="showCreateModal" 
      class="fixed inset-0 z-50 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-category-modal-title"
      @click.self="showCreateModal = false"
    >
      <div class="bg-canvas w-full max-w-md rounded-[16px] border border-hairline shadow-xl p-6 sm:p-8 space-y-6">
        <div class="flex items-center justify-between border-b border-hairline pb-4">
          <div>
            <h3 id="create-category-modal-title" class="font-display text-lg font-semibold text-ink">Buat Kategori Baru</h3>
            <p class="text-xs text-slate">Tambahkan label pengelompokan transaksi.</p>
          </div>
          <button @click="showCreateModal = false" type="button" aria-label="Tutup form buat kategori" class="text-slate hover:text-ink p-1 cursor-pointer">✕</button>
        </div>

        <form @submit.prevent="handleCreateCategory" class="space-y-5">
          <!-- Input Type Segmented Control -->
          <div>
            <label class="block font-body text-xs font-semibold text-ink uppercase tracking-wider mb-2">
              Tipe Kategori
            </label>
            <div class="grid grid-cols-2 gap-2 bg-paper p-1.5 rounded-xl border border-hairline">
              <button 
                type="button"
                @click="createForm.type = 'expense'"
                :class="[
                  'py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                  createForm.type === 'expense' 
                    ? 'bg-canvas text-coral shadow-2xs border border-coral/30' 
                    : 'text-slate hover:text-ink'
                ]"
              >
                <span>↑ Pengeluaran</span>
              </button>

              <button 
                type="button"
                @click="createForm.type = 'income'"
                :class="[
                  'py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                  createForm.type === 'income' 
                    ? 'bg-canvas text-emerald shadow-2xs border border-emerald/30' 
                    : 'text-slate hover:text-ink'
                ]"
              >
                <span>↓ Pemasukan</span>
              </button>
            </div>
          </div>

          <!-- Input Category Name -->
          <div>
            <label for="create-category-name" class="block font-body text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Nama Kategori
            </label>
            <input 
              id="create-category-name"
              v-model="createForm.name"
              type="text"
              :placeholder="createForm.type === 'income' ? 'Contoh: Gaji, Bonus, Investasi' : 'Contoh: Makanan, Transportasi, Tagihan'"
              :disabled="actionLoading"
              class="w-full px-4 py-2.5 bg-canvas text-ink placeholder:text-silver text-sm font-body border border-hairline focus:border-indigo focus:ring-1 focus:ring-indigo rounded-inputs focus:outline-none"
            />
            <p v-if="createFormError" class="mt-1 text-xs text-coral font-body">
              {{ createFormError }}
            </p>
          </div>

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
              {{ actionLoading ? 'Menyimpan...' : 'Simpan Kategori' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 2: EDIT CATEGORY NAME -->
    <div 
      v-if="showEditModal" 
      class="fixed inset-0 z-50 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-category-modal-title"
      @click.self="showEditModal = false"
    >
      <div class="bg-canvas w-full max-w-md rounded-[16px] border border-hairline shadow-xl p-6 sm:p-8 space-y-6">
        <div class="flex items-center justify-between border-b border-hairline pb-4">
          <div>
            <h3 id="edit-category-modal-title" class="font-display text-lg font-semibold text-ink">Edit Nama Kategori</h3>
            <p class="text-xs text-slate">Ubah nama label kategori Anda.</p>
          </div>
          <button @click="showEditModal = false" type="button" aria-label="Tutup form edit kategori" class="text-slate hover:text-ink p-1 cursor-pointer">✕</button>
        </div>

        <form @submit.prevent="handleEditCategory" class="space-y-4">
          <!-- Read-Only Category Type -->
          <div>
            <label class="block font-body text-xs font-semibold text-slate uppercase tracking-wider mb-1.5">
              Tipe Kategori (Read-Only)
            </label>
            <div class="px-4 py-2.5 bg-paper rounded-inputs border border-hairline text-sm font-semibold flex items-center gap-2">
              <span :class="editingCategory?.type === 'income' ? 'text-emerald' : 'text-coral'">
                {{ editingCategory?.type === 'income' ? '↓ Pemasukan (Income)' : '↑ Pengeluaran (Expense)' }}
              </span>
            </div>
            <p class="mt-1 text-[11px] text-slate font-body">
              ⚠️ Tipe kategori ditentukan saat pembuatan dan tidak dapat diubah.
            </p>
          </div>

          <!-- Input Category Name -->
          <div>
            <label for="edit-category-name" class="block font-body text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Nama Kategori Baru
            </label>
            <input 
              id="edit-category-name"
              v-model="editForm.name"
              type="text"
              placeholder="Masukkan nama kategori baru"
              :disabled="actionLoading"
              class="w-full px-4 py-2.5 bg-canvas text-ink placeholder:text-silver text-sm font-body border border-hairline focus:border-indigo focus:ring-1 focus:ring-indigo rounded-inputs focus:outline-none"
            />
            <p v-if="editFormError" class="mt-1 text-xs text-coral font-body">
              {{ editFormError }}
            </p>
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
      aria-labelledby="delete-category-modal-title"
      @click.self="showDeleteModal = false"
    >
      <div class="bg-canvas w-full max-w-md rounded-[16px] border border-hairline shadow-xl p-6 sm:p-8 space-y-6">
        <div class="flex items-center justify-between border-b border-hairline pb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-lg bg-coral/10 text-coral flex items-center justify-center font-bold">
              ⚠️
            </div>
            <div>
              <h3 id="delete-category-modal-title" class="font-display text-lg font-semibold text-ink">Hapus Kategori</h3>
              <p class="text-xs text-slate">Konfirmasi penghapusan kategori transaksi.</p>
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
          Apakah Anda yakin ingin menghapus kategori <strong class="font-semibold text-indigo">"{{ deletingCategory?.name }}"</strong>?
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
            @click="handleDeleteCategory"
            :disabled="actionLoading"
            class="py-2.5 px-5 bg-coral hover:bg-coral/90 text-canvas font-body text-sm font-semibold rounded-lg transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {{ actionLoading ? 'Menghapus...' : 'Ya, Hapus Kategori' }}
          </button>
        </div>
      </div>
  </div>
</template>
