import { defineVitestConfig } from '@nuxt/test-utils/config'

// Tests unitarios y de componentes con el entorno `nuxt` (auto-imports, plugins, Pinia y el
// router reales) sobre happy-dom. Playwright e2e queda pendiente (P2, ver README).
export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    include: ['tests/**/*.test.ts'],
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',
        overrides: {
          // El typecheck de vue-tsc solo tiene sentido en `nuxt build`, no al levantar la app de tests.
          typescript: { typeCheck: false },
          // Base RELATIVA para el cliente `$api`: así `registerEndpoint('/backend/...')` intercepta
          // las llamadas de los composables y del store (una URL absoluta iría a la red de verdad).
          runtimeConfig: { public: { backendUrl: '/backend', searchUrl: '/search' } },
        },
      },
    },
  },
})
