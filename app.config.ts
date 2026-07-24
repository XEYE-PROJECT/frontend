// Configuración de build no secreta; lo dependiente del entorno va en runtimeConfig (nuxt.config.ts).
export default defineAppConfig({
  name: 'XEYE',
  tagline: 'Search, refined.',
  // Límites por defecto del playground de búsqueda.
  search: {
    defaultLimit: 20,
    maxLimit: 100,
  },
})
