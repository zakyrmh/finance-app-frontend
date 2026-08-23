export type TransactionType = 'income' | 'expense' | 'transfer'

export type TransactionItemPayload = {
  item_name: string
  qty: number
  price: number
  is_split: boolean
  debt_id?: string
}

export type CreateTransactionPayload = {
  type: TransactionType
  wallet_id: string
  to_wallet_id?: string
  category_id?: string
  description?: string
  items: TransactionItemPayload[]
}

export type TransactionSummary = {
  id: string
  type: TransactionType
  reference_code: string
  wallet_id: string
  total_amount: number
  description?: string
  created_at: string
}

export type TransactionListResponse = {
  message: string
  page: number
  limit: number
  data: TransactionSummary[]
}

export type TransactionResponse = {
  message: string
  data: TransactionSummary
}
