// Fail fast de la configuración pública en producción. Se ejecuta antes que el resto de
// plugins (prefijo 00.) y solo fuera de `nuxt dev`.
//
// Motivo: la SPA habla con dos servicios externos cuyas URLs vienen de NUXT_PUBLIC_*; si un
// deploy las pierde (pasó el 2026-07-28: `wrangler deploy` borró las variables del dashboard
// y la consola volvió a apuntar a localhost) la app "funciona" pero cada llamada falla de
// forma confusa. Mejor una pantalla de error que nombra la variable.

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]'])

export function publicUrlProblem(name: string, value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return `${name} is not set`
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return `${name} is not a valid URL (found '${value}')`
  }
  if (url.protocol !== 'https:') return `${name} must be an https:// URL in production (found '${value}')`
  if (LOCAL_HOSTS.has(url.hostname) || url.hostname.endsWith('.localhost')) {
    return `${name} must not point to localhost in production (found '${value}')`
  }
  return null
}

export default defineNuxtPlugin(() => {
  if (import.meta.dev) return

  const config = useRuntimeConfig()
  const problems = [
    publicUrlProblem('NUXT_PUBLIC_BACKEND_URL', config.public.backendUrl),
    publicUrlProblem('NUXT_PUBLIC_SEARCH_URL', config.public.searchUrl),
  ].filter((p): p is string => p !== null)

  if (problems.length > 0) {
    // fatal: Nuxt muestra error.vue con este mensaje en vez de arrancar la app.
    throw createError({
      statusCode: 500,
      statusMessage: 'Invalid console configuration',
      message: `Invalid console configuration:\n - ${problems.join('\n - ')}`,
      fatal: true,
    })
  }
})
