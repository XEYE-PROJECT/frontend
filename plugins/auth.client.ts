// Hidrata el token desde localStorage antes de que corra el middleware de rutas y carga el
// perfil desde el backend (nunca se guarda en el navegador). Si el token ya no vale, el
// plugin api limpia la sesión y redirige.
export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()
  auth.init()
  if (auth.isAuthenticated) {
    try {
      await auth.fetchMe()
    } catch {
      /* 401 → api.ts ya ha limpiado; otros errores: la app arranca sin perfil y lo reintenta al navegar */
    }
  } else {
    auth.ready = true
  }
})
