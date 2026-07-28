// Guard global: `/login`, `/register` y la documentación (`/docs*`) son públicas,
// el resto exige sesión; `/` redirige según el estado de autenticación.
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  const authPages = new Set(['/login', '/register'])
  const isDocs = to.path === '/docs' || to.path.startsWith('/docs/')
  const isPublic = authPages.has(to.path) || isDocs

  if (to.path === '/') {
    return navigateTo(auth.isAuthenticated ? '/dashboard' : '/login')
  }

  if (!auth.isAuthenticated && !isPublic) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }

  if (auth.isAuthenticated && authPages.has(to.path)) {
    return navigateTo('/dashboard')
  }
})
