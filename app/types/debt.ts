export type DebtType = 'payable' | 'receivable'
export type DebtStatus = 'active' | 'paid_off'

export type Debt = {
  id: string
  user_id: string
  counterparty_name: string
  type: DebtType
  total_amount: number
  paid_amount: number
  status: DebtStatus
  created_at: string
  updated_at: string
}

export type DebtListResponse = {
  message: string
  page: number
  limit: number
  data: Debt[]
}

export type DebtResponse = {
  message: string
  data: Debt
}

export type CreateDebtPayload = {
  counterparty_name: string
  type: DebtType
  total_amount: number
}

export type UpdateDebtPayload = {
  counterparty_name: string
  total_amount: number
}
