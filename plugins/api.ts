import type { $Fetch } from 'nitropack'

// Cliente API del backend: base URL de runtimeConfig, token bearer por petición
// y cierre de sesión + redirección automáticos si una llamada autenticada da 401.
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

  const api = $fetch.create({
    baseURL: config.public.backendUrl,

    onRequest({ options }) {
      if (auth.token) {
        const headers = new Headers(options.headers as HeadersInit | undefined)
        headers.set('Authorization', `Bearer ${auth.token}`)
        options.headers = headers
      }
    },

    async onResponseError({ response }) {
      // Solo expulsa si había sesión (ignora los 401 de login/registro).
      if (response.status === 401 && auth.token) {
        auth.clearSession()
        if (import.meta.client) {
          await navigateTo('/login')
        }
      }
    },
  })

  return {
    provide: { api: api as $Fetch },
  }
})
