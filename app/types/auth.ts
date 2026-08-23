export type User = {
  id: string
  name: string
  email: string
  created_at: string
}

export type AuthResponse = {
  message: string
  data: User
}

export type ApiError = {
  error: string
}

export type RegisterPayload = {
  name: string
  email: string
  password: string
}

export type LoginPayload = {
  email: string
  password: string
}
