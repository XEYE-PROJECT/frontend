<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="bg-grid flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
    <div class="absolute top-4 right-4 flex items-center gap-1">
      <UiThemeToggle />
      <UiLangSwitcher />
    </div>

    <span
      class="bg-brand-gradient grid h-14 w-14 place-items-center rounded-2xl text-white shadow-pop"
    >
      <UiIcon name="eye" :size="28" />
    </span>

    <p class="mt-6 font-mono text-5xl font-semibold text-gradient">{{ error.statusCode || 500 }}</p>
    <h1 class="mt-3 text-xl font-semibold text-fg">{{ $t('notFound.title') }}</h1>
    <p class="mt-2 max-w-sm text-sm text-muted">{{ $t('notFound.desc') }}</p>
    <!-- Errores que no son 404 (p. ej. configuración inválida detectada al arrancar): el mensaje real. -->
    <pre
      v-if="error.statusCode !== 404 && error.message"
      class="mt-4 max-w-lg whitespace-pre-wrap rounded-lg border border-line bg-surface p-3 text-left font-mono text-xs text-muted"
    >{{ error.message }}</pre>

    <UiButton class="mt-6" icon="arrow-left" @click="goHome">{{ $t('notFound.home') }}</UiButton>
    <!-- Un 5xx suele ser un servicio caído: la página de estado lo confirma sin adivinar. -->
    <NuxtLink to="/status" class="mt-4 text-sm font-medium text-primary hover:underline">
      {{ $t('notFound.status') }}
    </NuxtLink>
  </div>
</template>
