export type CategoryType = 'income' | 'expense'

export type Category = {
  id: string
  user_id: string
  name: string
  type: CategoryType
  created_at: string
}

export type CategoryListResponse = {
  message: string
  data: Category[]
}

export type CategoryResponse = {
  message: string
  data: Category
}

export type CreateCategoryPayload = {
  name: string
  type: CategoryType
}

export type UpdateCategoryPayload = {
  name: string
}
