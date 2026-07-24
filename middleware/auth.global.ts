// Guard global: `/login` y `/register` son públicas, el resto exige sesión;
// `/` redirige según el estado de autenticación.
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  const publicPages = new Set(['/login', '/register'])
  const isPublic = publicPages.has(to.path)

  if (to.path === '/') {
    return navigateTo(auth.isAuthenticated ? '/dashboard' : '/login')
  }

  if (!auth.isAuthenticated && !isPublic) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }

  if (auth.isAuthenticated && isPublic) {
    return navigateTo('/dashboard')
  }
})
