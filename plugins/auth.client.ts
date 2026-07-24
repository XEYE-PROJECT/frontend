// Hidrata la sesión desde localStorage antes de que corra el middleware de rutas.
export default defineNuxtPlugin(() => {
  useAuthStore().init()
})
