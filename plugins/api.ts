import type { $Fetch } from 'nitropack'

// Cliente API del backend: base URL de runtimeConfig, token bearer por petición y cierre de
// sesión + redirección a /login (conservando la ruta actual en `redirect`) si una llamada
// autenticada da 401 (token caducado, revocado o sesión cerrada desde otro sitio).
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

    async onResponseError({ request, response }) {
      const url = String(request)
      // Solo expulsa si había sesión; los 401 de los propios endpoints de auth (login, mfa,
      // logout con token ya revocado…) los gestiona cada página.
      if (response.status === 401 && auth.token && !url.includes('/auth/')) {
        auth.clearSession()
        if (import.meta.client) {
          const route = useRoute()
          const isAuthPage = route.path === '/login' || route.path === '/register'
          await navigateTo({
            path: '/login',
            query: isAuthPage ? {} : { redirect: route.fullPath, reason: 'expired' },
          })
        }
      }
    },
  })

  return {
    provide: { api: api as $Fetch },
  }
})
