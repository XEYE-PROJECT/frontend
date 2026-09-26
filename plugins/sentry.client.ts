import * as Sentry from '@sentry/vue'

// Error tracking del navegador. Solo con NUXT_PUBLIC_SENTRY_DSN (vacío = desactivado). Se usa
// @sentry/vue y no @sentry/nuxt: la app es SPA (ssr: false) y el módulo de Nuxt instrumenta
// también el servidor Nitro, innecesario y problemático en Cloudflare Workers.
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const dsn = config.public.sentryDsn
  if (!dsn) return

  Sentry.init({
    app: nuxtApp.vueApp,
    dsn,
    environment: config.public.sentryEnvironment || 'production',
    release: config.app.buildId,
    tracesSampleRate: 0,
  })
})
