# Changelog

Formato [Keep a Changelog](https://keepachangelog.com/es/1.1.0/); versiones [SemVer](https://semver.org/lang/es/).
Las entradas nuevas van en "Unreleased"; `bash release.sh X.Y.Z` las convierte en una versión y
crea el tag que publica la GitHub Release (la consola se despliega desde master vía Cloudflare).

## [Unreleased]

### Añadido

- Consola XEYE en Nuxt 3 (SPA en Cloudflare Workers): cuentas con verificación, recuperación,
  2FA y SSO; listas, elementos e importación; entrenamientos con cola y modelos; playground de
  búsqueda a través del backend; API keys mostradas una sola vez; administración de usuarios;
  documentación pública y página de estado `/status`.
- Seguridad: CSP con nonce, cabeceras estrictas, guard de configuración pública, Sentry.
- Calidad: ESLint + Prettier, Vitest (utils, store, composables y componentes), typecheck en el
  build, CI con gitleaks y Trivy, Dockerfile con pnpm para probar el build en local.
- Ajustes de lista: interruptor "Descripciones con IA" (opt-out del LLM por lista; el backend
  entrena esas listas sin paso de IA y el worker no envía sus textos a ningún modelo).

[Unreleased]: https://github.com/XEYE-PROJECT/frontend/compare/master...HEAD
