# Referencia de configuración — consola XEYE (frontend)

La consola es una SPA (`ssr: false`) desplegada en Cloudflare Workers. Toda su configuración es
**pública** (viaja al navegador): no hay secretos aquí, y no debe haberlos nunca.

## Dónde se configura

| Entorno | Fuente | Notas |
|---|---|---|
| `nuxt dev` / build local | `.env` (`NUXT_PUBLIC_*`) | copia de `.env.example` |
| Producción (Workers) | `nuxt.config.ts` → `nitro.cloudflare.wrangler.vars` | **no** el dashboard de Cloudflare: `wrangler deploy` borra las variables añadidas a mano (incidente del 2026-07-28) |

## Variables

| Variable | Descripción | Default dev | Prod | Valida |
|---|---|---|---|---|
| `NUXT_PUBLIC_BACKEND_URL` | URL pública del backend (auth, listas, claves, entrenamientos) | `http://localhost:8000` | **`https://backend.xeye.es`** | `https://`, sin localhost |
| `NUXT_PUBLIC_SEARCH_URL` | URL pública del search-service, solo para los ejemplos de la documentación (el playground busca vía backend: `POST /lists/{id}/search`) | `http://localhost:8002` | **`https://search.xeye.es`** | `https://`, sin localhost |
| `NUXT_PUBLIC_SENTRY_DSN` | DSN del proyecto `xeye-frontend` (público por naturaleza; vacío = desactivado) | vacío | recomendado | — |
| `NUXT_PUBLIC_SENTRY_ENVIRONMENT` | Etiqueta de entorno en Sentry | `local` | `production` | — |
| `NITRO_PORT` / `NITRO_HOST` | Solo al servir el build con Nitro en un contenedor | `3000` / — | — | — |

Lo que la consola necesita del backend en runtime (CAPTCHA site key, proveedores SSO
disponibles, duración de sesión) lo lee de `GET /auth/config`, no de variables propias.

## Fail fast

- **Runtime** (`plugins/00.config-guard.client.ts`, fuera de `nuxt dev`): si `NUXT_PUBLIC_BACKEND_URL`
  o `NUXT_PUBLIC_SEARCH_URL` faltan, no son `https://` o apuntan a `localhost`, la app no arranca:
  `error.vue` muestra el mensaje nombrando la variable.
- **Build** (`nuxt.config.ts`): las constantes `PROD_BACKEND_URL` / `PROD_SEARCH_URL` (que generan
  el `wrangler.json` y la CSP `connect-src`) deben ser `https://` públicas; si no, el build falla.

## Lo que el navegador guarda

Solo el token de sesión y su caducidad (`xeye_token`, `xeye_token_expires_at`) y el token de
dispositivo 2FA recordado (`xeye_mfa_trust`) en `localStorage`; la API key pegada en el playground
de búsqueda vive en `sessionStorage` (`xeye_search_key`) y muere con la pestaña. Nunca el perfil
ni contraseñas.

## Comprobación rápida

```bash
pnpm build && pnpm preview          # sirve el build; sin NUXT_PUBLIC_* verás la pantalla de error del guard
NUXT_PUBLIC_BACKEND_URL=https://backend.xeye.es NUXT_PUBLIC_SEARCH_URL=https://search.xeye.es pnpm preview
curl -sI https://xeye.es/ | grep -i content-security-policy   # connect-src con las dos URLs
```
