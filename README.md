<div align="center">

# 👁️ XEYE Console

Consola web de **XEYE**, reconstruida desde cero con **Nuxt 3 + Vue 3 + Tailwind v4**.
Diseño *Iris*: un único sistema de diseño con tema **claro y oscuro**, bilingüe **ES/EN**,
más cuidado e intuitivo que el frontend anterior.

</div>

---

## Cuentas y sesión

- El registro no abre sesión: el backend envía un email de verificación (`/verify-email?token=…`
  abre sesión al confirmarlo). Recuperación en `/forgot-password` → `/reset-password?token=…`.
- Solo el token JWT y su caducidad se guardan en `localStorage`; el perfil se pide a `/users/me`
  al arrancar (`plugins/auth.client.ts`). Al caducar el token o recibir un 401 la sesión se cierra
  y se vuelve a `/login?redirect=<ruta>`; el logout revoca el token en el servidor.
- Login en dos pasos si la cuenta tiene 2FA (`mfaRequired` → `POST /auth/mfa`). La cuenta permite
  activar/desactivar el 2FA (QR con `qrcode`), cambiar email/contraseña con la contraseña actual y
  cerrar todas las sesiones. `/admin/users` solo aparece a los admins.
- SSO (Google/Microsoft) y CAPTCHA (Turnstile) se muestran solo si el backend los anuncia en
  `GET /auth/config`; el retorno del SSO es `/sso/callback?code=…`.

## ¿Qué es?

El panel para gestionar todo lo que expone el backend de XEYE y probar la búsqueda:

- **Autenticación** (registro / login con JWT).
- **Listas** — colecciones de elementos que se vuelven buscables al entrenarse.
- **Elementos** — los ítems de cada lista (texto, *params* opcionales, descripción).
- **Entrenamientos** — historial por lista (estado, modelo, duración, coste, el activo).
- **Claves API** — para consultar tus listas públicas desde el servicio de búsqueda. El valor
  completo se muestra **una sola vez** al crear la clave (el backend solo guarda su hash).
- **Búsqueda** — un *playground* que llama **directamente al microservicio de búsqueda**
  (no al backend), exactamente como lo haría una integración real: pegas tu clave API (se
  recuerda solo en la pestaña) y eliges la lista.
- **Cuenta** — perfil, contraseña y borrado de cuenta.

## Arquitectura

```text
Navegador (SPA Nuxt, :3000)
   ├─ REST + JWT ─────────────►  Backend        (:8000)  auth, lists, elements, api-keys, trainings
   └─ POST /api/v1/search ─────►  Search service (:8002)  X-API-Key, búsqueda directa
```

- **SPA** (`ssr: false`): el token JWT vive en `localStorage`; las llamadas salen del navegador.
- Las búsquedas **no pasan por el backend**: van directas al search service con la cabecera
  `X-API-Key` sobre una lista **pública** del usuario.

## Stack

| Área | Tecnología |
|------|-----------|
| Framework | **Nuxt 3** (Vue 3, `<script setup lang="ts">`, auto-imports, file-based routing) |
| Estilos | **Tailwind CSS v4** (config *CSS-first*, tokens semánticos claro/oscuro) |
| Estado | **Pinia** (sesión) + composables `useState` (tema, idioma, toasts) |
| i18n | ligero y propio (ES/EN, sin dependencias) |
| HTTP | `$fetch` (ofetch) con cliente autenticado e interceptor 401 |

Sin librería de iconos ni de UI externas: **kit de UI e iconos propios** (`components/ui`).

## Puesta en marcha

Requisitos: **Node 20+**.

```bash
npm install
cp .env.example .env      # ajusta las URLs si hace falta
npm run dev               # http://localhost:3000
```

> El backend permite CORS desde `http://localhost:3000` por defecto, así que no hay que
> tocar nada para desarrollo local.

### Variables de entorno

| Variable | Descripción | Por defecto |
|----------|-------------|-------------|
| `NUXT_PUBLIC_BACKEND_URL` | URL del backend (auth, listas, claves, …) | `http://localhost:8000` |
| `NUXT_PUBLIC_SEARCH_URL`  | URL del microservicio de búsqueda | `http://localhost:8002` |

Al ser una SPA, estas URLs las usa el **navegador**: en producción apúntalas a tus dominios
públicos, no a los nombres internos de Docker. Referencia completa (incluido Sentry y qué es
obligatorio en producción) en [CONFIG.md](CONFIG.md).

**Fail fast.** Fuera de `nuxt dev`, `plugins/00.config-guard.client.ts` comprueba al arrancar que
las dos URLs son `https://` y no `localhost`; si no, la consola muestra una pantalla de error que
nombra la variable en vez de fallar llamada a llamada. Las constantes de producción de
`nuxt.config.ts` (`PROD_*_URL`, que viajan al `wrangler.json` generado) se validan además en build.

## Scripts

```bash
npm run dev         # servidor de desarrollo (hot reload)
npm run build       # build de producción (servidor Nitro)
npm run preview     # previsualiza el build
npm run generate    # sitio estático (.output/public)
npm run typecheck   # vue-tsc
```

## Docker

```bash
# red compartida del workspace (una vez)
../create-network.sh

# build + run (sirve la SPA con el servidor Nitro en :3000)
docker compose up --build
```

## Notas / troubleshooting

- **`nuxt dev` y `ssr: false`.** En Nuxt 3.21.x el servidor de desarrollo peta con
  `No entry found in rollupOptions.input` en modo SPA salvo que esté activo
  `experimental.viteEnvironmentApi: true` (ya configurado en `nuxt.config.ts`). El `build` de
  producción no se ve afectado, así que no quites esa opción aunque el build funcione sin ella.
- **Vite fijado a v6.** Nuxt 3.21 aún no es estable con Vite 7/8 en dev; `package.json` fuerza
  Vite 6 vía `overrides`/`pnpm.overrides`. No lo subas sin probar `pnpm dev`.
- **Gestor de paquetes: pnpm.** Usa `pnpm install` / `pnpm dev` (hay `pnpm-lock.yaml`).

## Estructura

```text
frontend/
├─ assets/css/main.css      # design system "Iris" (tokens claro/oscuro, Tailwind v4)
├─ components/
│  ├─ ui/                   # kit de UI (Button, Card, Modal, Input, Badge, Toaster, …)
│  ├─ app/                  # shell (Sidebar, Topbar, UserMenu, PageHeader, StatCard)
│  ├─ lists/ elements/ apikeys/ trainings/ search/   # componentes por feature
├─ composables/             # useApi via plugins, useLists/Elements/ApiKeys/Trainings,
│                           # useSearchApi, useI18n, useTheme, useToast, useClipboard
├─ layouts/                 # default (app), auth (login/registro)
├─ locales/                 # es.ts / en.ts (tipados y sincronizados)
├─ middleware/              # auth.global.ts (guard de rutas)
├─ pages/                   # login, register, dashboard, lists, api-keys, search, account
├─ plugins/                 # api (cliente + 401), auth, i18n, theme
├─ stores/                  # auth (Pinia)
├─ types/api.ts             # contratos que reflejan el backend y el search service
└─ utils/                   # apiError, format (fechas, números, params, …)
```

## Rutas

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/login`, `/register` | Autenticación | Solo invitados |
| `/dashboard` | Resumen (métricas, accesos rápidos) | Privado |
| `/lists`, `/lists/:id` | Listas y su detalle (elementos · entrenamientos · ajustes) | Privado |
| `/api-keys` | Gestión de claves API | Privado |
| `/search` | Búsqueda directa al microservicio | Privado |
| `/account` | Perfil y seguridad | Privado |

---

<div align="center"><sub>XEYE — Search, refined.</sub></div>
