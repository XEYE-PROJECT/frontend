// Guard global: las páginas de acceso (`/login`, `/register`, verificación, recuperación, retorno
// del SSO) y la documentación (`/docs*`) son públicas, el resto exige sesión; `/admin/*` exige
// además el rol admin; `/` redirige según el estado de autenticación.
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  const authPages = new Set(['/login', '/register'])
  const publicPages = new Set([
    ...authPages,
    '/verify-email',
    '/forgot-password',
    '/reset-password',
    '/sso/callback',
  ])
  const isDocs = to.path === '/docs' || to.path.startsWith('/docs/')
  const isPublic = publicPages.has(to.path) || isDocs

  if (to.path === '/') {
    return navigateTo(auth.isAuthenticated ? '/dashboard' : '/login')
  }

  if (!auth.isAuthenticated && !isPublic) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }

  if (auth.isAuthenticated && authPages.has(to.path)) {
    return navigateTo('/dashboard')
  }

  if (to.path.startsWith('/admin') && auth.isAuthenticated && !auth.isAdmin) {
    return navigateTo('/dashboard')
  }
})
