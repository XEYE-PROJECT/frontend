import tailwindcss from '@tailwindcss/vite'

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

  modules: ['@pinia/nuxt'],

  css: ['~/assets/css/main.css'],

  // Tailwind v4 vía plugin oficial de Vite (la config CSS-first vive en main.css).
  vite: {
    plugins: [tailwindcss()],
  },

  // Config pública, sobrescribible en runtime con variables NUXT_PUBLIC_*.
  runtimeConfig: {
    public: {
      backendUrl: 'http://localhost:8000',
      searchUrl: 'http://localhost:8002',
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
          NUXT_PUBLIC_BACKEND_URL: 'https://backend.xeye.es',
          NUXT_PUBLIC_SEARCH_URL: 'https://search.xeye.es',
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
      // Aplica tema e idioma guardados antes del primer pintado para evitar parpadeo.
      script: [
        {
          innerHTML:
            "(function(){try{var t=localStorage.getItem('xeye_theme');var d=t?t==='dark':(window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches);if(d)document.documentElement.classList.add('dark');var l=localStorage.getItem('xeye_locale');if(l==='es'||l==='en')document.documentElement.setAttribute('lang',l);}catch(e){}})();",
          tagPosition: 'head',
        },
      ],
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },
})
