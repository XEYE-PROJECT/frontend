<script setup lang="ts">
// Botones "Continuar con…": enlaces al backend, que redirige al proveedor OIDC y vuelve a
// /sso/callback con un código de un solo uso. Solo aparecen los proveedores configurados.
const { config } = useAuthConfig()
const { locale } = useI18n()
const runtime = useRuntimeConfig()

const providers = computed(() =>
  config.value.ssoProviders.map((id) => ({
    id,
    label: id === 'google' ? 'Google' : id === 'microsoft' ? 'Microsoft' : id,
    href: `${runtime.public.backendUrl}/auth/sso/${id}?locale=${locale.value}`,
  })),
)
</script>

<template>
  <div v-if="providers.length" class="space-y-3">
    <div class="flex items-center gap-3 text-xs text-subtle">
      <span class="h-px flex-1 bg-line" />
      {{ $t('auth.orContinueWith') }}
      <span class="h-px flex-1 bg-line" />
    </div>
    <div class="grid gap-2" :class="providers.length > 1 ? 'grid-cols-2' : 'grid-cols-1'">
      <a
        v-for="p in providers"
        :key="p.id"
        :href="p.href"
        class="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-medium text-fg transition-theme hover:bg-surface-2"
      >
        <svg v-if="p.id === 'google'" width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.9 6.1C12.4 13.4 17.7 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/>
          <path fill="#FBBC05" d="M10.5 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.1.8-4.6l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.9-6.1z"/>
          <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4-13.5-9.9l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/>
        </svg>
        <svg v-else-if="p.id === 'microsoft'" width="18" height="18" viewBox="0 0 23 23" aria-hidden="true">
          <rect x="1" y="1" width="10" height="10" fill="#F25022"/><rect x="12" y="1" width="10" height="10" fill="#7FBA00"/>
          <rect x="1" y="12" width="10" height="10" fill="#00A4EF"/><rect x="12" y="12" width="10" height="10" fill="#FFB900"/>
        </svg>
        {{ p.label }}
      </a>
    </div>
  </div>
</template>
