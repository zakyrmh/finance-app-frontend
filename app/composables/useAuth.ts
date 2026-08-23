import type { AuthResponse, LoginPayload, RegisterPayload, User } from '~/types/auth'

export function useAuth() {
  const api = useApi()
  const userCookie = useCookie<User | null>('waletify_user', {
    default: () => null,
    sameSite: 'lax'
  })
  const user = useState<User | null>('auth:user', () => userCookie.value)

  async function register(payload: RegisterPayload) {
    const response = await api<AuthResponse>('/auth/register', {
      method: 'POST',
      body: payload
    })

    user.value = response.data
    userCookie.value = response.data
    return response.data
  }

  async function login(payload: LoginPayload) {
    const response = await api<AuthResponse>('/auth/login', {
      method: 'POST',
      body: payload
    })

    user.value = response.data
    userCookie.value = response.data
    return response.data
  }

  function setUser(value: User | null) {
    user.value = value
    userCookie.value = value
  }

  async function logout() {
    user.value = null
    userCookie.value = null
    try {
      await api('/auth/logout', { method: 'POST' })
    } catch (_) {
      // Fallback for current backend without POST /auth/logout
    }
    await navigateTo('/login')
  }

  return {
    user,
    register,
    login,
    logout,
    setUser
  }
}
