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

    <UiButton class="mt-6" icon="arrow-left" @click="goHome">{{ $t('notFound.home') }}</UiButton>
  </div>
</template>
