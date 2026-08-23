export default defineNuxtRouteMiddleware(async () => {
  const userCookie = useCookie('waletify_user')

  // If frontend auth state is cleared (logged out or never logged in), allow guest access
  if (!userCookie.value) {
    return
  }

  const api = useApi()

  try {
    // Ping lightweight private endpoint to check if session token cookie is still active
    await api('/wallets?limit=1')
    // If successful, user is already logged in -> redirect to dashboard
    return navigateTo('/dashboard')
  } catch (error: any) {
    // If 401 or error, session expired -> clear stale frontend state and allow guest access
    userCookie.value = null
  }
})

