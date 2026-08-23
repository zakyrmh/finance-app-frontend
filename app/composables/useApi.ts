export function useApi() {
  const config = useRuntimeConfig()
  const headers: Record<string, string> = {
    Accept: 'application/json'
  }

  // Forward browser cookies to backend during SSR
  if (import.meta.server) {
    const requestHeaders = useRequestHeaders(['cookie'])
    if (requestHeaders.cookie) {
      headers.cookie = requestHeaders.cookie
    }
  }

  return $fetch.create({
    baseURL: config.public.apiBase,
    credentials: 'include',
    headers
  })
}
