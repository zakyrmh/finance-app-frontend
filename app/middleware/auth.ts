export default defineNuxtRouteMiddleware(async () => {
  const userCookie = useCookie('waletify_user')

  // If frontend auth state is cleared, redirect to login immediately
  if (!userCookie.value) {
    return navigateTo('/login')
  }

  const api = useApi()

  try {
    // Ping lightweight private endpoint to verify valid session cookie
    await api('/wallets?limit=1')
  } catch (error: any) {
    if (error?.status === 401 || error?.statusCode === 401 || error?.response?.status === 401) {
      // Session expired -> clear stale frontend state and redirect to login
      userCookie.value = null
      return navigateTo('/login')
    }
  }
})

