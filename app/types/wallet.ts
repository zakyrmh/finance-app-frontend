export type Wallet = {
  id: string
  user_id: string
  name: string
  balance: number
  created_at: string
  updated_at: string
}

export type WalletListResponse = {
  message: string
  page: number
  limit: number
  data: Wallet[]
}

export type WalletResponse = {
  message: string
  data: Wallet
}

export type CreateWalletPayload = {
  name: string
}

export type UpdateWalletPayload = {
  name: string
}
