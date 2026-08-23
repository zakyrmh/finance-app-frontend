import type { Category, CategoryListResponse, CategoryResponse, CreateCategoryPayload, UpdateCategoryPayload } from '~/types/category'

export function useCategories() {
  const api = useApi()
  const categories = useState<Category[]>('categories:list', () => [])
  const loading = useState<boolean>('categories:loading', () => false)
  const error = useState<string | null>('categories:error', () => null)

  const incomeCategories = computed(() => {
    return categories.value.filter(c => c.type === 'income')
  })

  const expenseCategories = computed(() => {
    return categories.value.filter(c => c.type === 'expense')
  })

  async function fetchCategories() {
    loading.value = true
    error.value = null
    try {
      const response = await api<CategoryListResponse>('/categories', {
        method: 'GET'
      })
      categories.value = response.data || []
      return response.data
    } catch (err: any) {
      error.value = err?.data?.error || err?.message || 'Gagal mengambil daftar kategori'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createCategory(payload: CreateCategoryPayload) {
    error.value = null
    try {
      const response = await api<CategoryResponse>('/categories', {
        method: 'POST',
        body: payload
      })
      if (response.data) {
        categories.value.push(response.data)
      }
      return response.data
    } catch (err: any) {
      error.value = err?.data?.error || err?.message || 'Gagal membuat kategori baru'
      throw err
    }
  }

  async function updateCategory(id: string, payload: UpdateCategoryPayload) {
    error.value = null
    try {
      await api<{ message: string }>(`/categories/${id}`, {
        method: 'PUT',
        body: payload
      })
      const target = categories.value.find(c => c.id === id)
      if (target) {
        target.name = payload.name
      }
    } catch (err: any) {
      error.value = err?.data?.error || err?.message || 'Gagal mengubah nama kategori'
      throw err
    }
  }

  async function deleteCategory(id: string) {
    error.value = null
    try {
      await api<{ message: string }>(`/categories/${id}`, {
        method: 'DELETE'
      })
      categories.value = categories.value.filter(c => c.id !== id)
    } catch (err: any) {
      error.value = err?.data?.error || err?.message || 'Gagal menghapus kategori'
      throw err
    }
  }

  return {
    categories,
    loading,
    error,
    incomeCategories,
    expenseCategories,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  }
}
