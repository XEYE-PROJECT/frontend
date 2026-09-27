import tailwindcss from '@tailwindcss/vite'

// URLs públicas de producción: una sola fuente para las variables del Worker y para la CSP.
const PROD_BACKEND_URL = 'https://backend.xeye.es'
const PROD_SEARCH_URL = 'https://search.xeye.es'

// Fail fast en build: si alguien cambia las constantes a http:// o localhost, el build falla
// antes de que el Worker despliegue una consola que no puede hablar con nadie. (En runtime lo
// vuelve a comprobar plugins/00.config-guard.client.ts con los valores NUXT_PUBLIC_* reales.)
for (const [name, value] of Object.entries({ PROD_BACKEND_URL, PROD_SEARCH_URL })) {
  const url = new URL(value)
  if (url.protocol !== 'https:' || url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    throw new Error(`${name} must be a public https:// URL (found '${value}')`)
  }
}

// Consola XEYE — SPA (sin SSR): el auth es JWT en localStorage y se habla con dos
// servicios externos, así que el SSR no aporta nada y complica la autenticación.
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  ssr: false,

  // OBLIGATORIO con `ssr: false` en Nuxt 3.21.x: sin la environments API de Vite,
  // `nuxt dev` peta en resolveServerEntry ("No entry found in rollupOptions.input").
  // `nuxt build` no se ve afectado — no lo quites pensando que dev/build coinciden.
  experimental: { viteEnvironmentApi: true },

  // Puerto 3000 en dev: es el que espera el CORS del backend (3001/3002 también valen).
  devServer: { port: 3000 },

  devtools: { enabled: true },

  modules: ['@pinia/nuxt', 'nuxt-security'],

  // Cabeceras de seguridad del documento (lo genera Nitro en el Worker en cada petición).
  // Los assets /_nuxt/* los sirve el binding de assets de Cloudflare: sus cabeceras van en
  // public/_headers. Verificar tras cada deploy: `curl -sI https://xeye.es/`.
  security: {
    nonce: true,
    headers: {
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        // Nuxt inyecta un script inline con la runtime config: nuxt-security le pone el nonce.
        // Sin 'strict-dynamic' para que los chunks de /_nuxt/* (mismo origen) carguen sin más.
        // challenges.cloudflare.com: widget de Turnstile (CAPTCHA opcional; solo se carga si el
        // backend anuncia un site key en GET /auth/config).
        'script-src': ["'self'", "'nonce-{{nonce}}'", 'https://challenges.cloudflare.com'],
        'frame-src': ['https://challenges.cloudflare.com'],
        // Tailwind v4 y las transiciones de Vue inyectan estilos inline.
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:'],
        'font-src': ["'self'"],
        // Solo el backend y el ingest de Sentry (en dev se añade el localhost, ver $development
        // más abajo). La consola NO llama al servicio de búsqueda: el playground pasa por el
        // backend, así que search.xeye.es no está en la CSP (PROD_SEARCH_URL solo se usa en los
        // ejemplos de la documentación).
        'connect-src': ["'self'", PROD_BACKEND_URL, 'https://*.sentry.io', 'https://challenges.cloudflare.com'],
        'frame-ancestors': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'object-src': ["'none'"],
        'upgrade-insecure-requests': true,
      },
      strictTransportSecurity: { maxAge: 31536000, includeSubdomains: true },
      xFrameOptions: 'DENY',
      referrerPolicy: 'strict-origin-when-cross-origin',
      crossOriginOpenerPolicy: 'same-origin',
      crossOriginResourcePolicy: 'same-origin',
      crossOriginEmbedderPolicy: false,
      permissionsPolicy: { camera: [], microphone: [], geolocation: [] },
    },
    // Sin API propia en Nitro: estos middlewares no aportan y usan estado en memoria del Worker.
    rateLimiter: false,
    requestSizeLimiter: false,
    xssValidator: false,
    corsHandler: false,
  },

  css: ['~/assets/css/main.css'],

  // Tailwind v4 vía plugin oficial de Vite (la config CSS-first vive en main.css).
  vite: {
    plugins: [tailwindcss()],
  },

  // Solo `nuxt dev`: los servicios locales en la CSP y sin upgrade a https (rompería las
  // llamadas a http://localhost). Nuxt fusiona esto sobre la config base (los arrays se concatenan).
  $development: {
    security: {
      headers: {
        contentSecurityPolicy: {
          'connect-src': ['http://localhost:8000', 'ws://localhost:*'],
          'upgrade-insecure-requests': false,
        },
      },
    },
  },

  // Config pública, sobrescribible en runtime con variables NUXT_PUBLIC_*.
  runtimeConfig: {
    public: {
      backendUrl: 'http://localhost:8000',
      // Solo para los ejemplos de la página de documentación (la consola no lo llama).
      searchUrl: 'http://localhost:8002',
      // Sentry (navegador). Vacío = desactivado. Un DSN es público: puede ir en el repo.
      sentryDsn: '',
      sentryEnvironment: '',
    },
  },

  // URLs de producción: viajan dentro del wrangler.json que Nitro genera en el build de
  // Cloudflare Workers, así cada deploy las re-aplica. No configurarlas a mano en el
  // dashboard: `wrangler deploy` ELIMINA las variables de texto añadidas por dashboard
  // en cada push (por eso el frontend volvió a apuntar a localhost el 2026-07-28).
  // Solo afecta al deploy en Workers; `nuxt dev` y builds locales las ignoran.
  nitro: {
    cloudflare: {
      wrangler: {
        vars: {
          NUXT_PUBLIC_BACKEND_URL: PROD_BACKEND_URL,
          NUXT_PUBLIC_SEARCH_URL: PROD_SEARCH_URL,
          // DSN del proyecto "xeye-frontend" de Sentry (público por naturaleza; vacío = sin error tracking).
          NUXT_PUBLIC_SENTRY_DSN:
            'https://a540a0c36582ce4ca6f47f7b1ab74b7b@o4512153980567552.ingest.de.sentry.io/4512154074415184',
          NUXT_PUBLIC_SENTRY_ENVIRONMENT: 'production',
        },
      },
    },
  },

  app: {
    head: {
      title: 'XEYE',
      htmlAttrs: { lang: 'es' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'XEYE console — build, train and search your lists.',
        },
        { name: 'color-scheme', content: 'light dark' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      // Aplica tema e idioma guardados antes del primer pintado para evitar parpadeo. Fichero
      // externo (public/theme-init.js) y no inline: así la CSP no necesita hashes.
      script: [{ src: '/theme-init.js', tagPosition: 'head' }],
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },
})
