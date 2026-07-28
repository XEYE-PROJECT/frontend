<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

const items = computed(() => [
  { to: '/docs', icon: 'book-open', label: t('docs.nav.intro') },
  { to: '/docs/getting-started', icon: 'sparkles', label: t('docs.nav.gettingStarted') },
  { to: '/docs/lists', icon: 'list', label: t('docs.nav.lists') },
  { to: '/docs/trainings', icon: 'zap', label: t('docs.nav.trainings') },
  { to: '/docs/api', icon: 'key', label: t('docs.nav.api') },
  { to: '/docs/best-practices', icon: 'check-circle', label: t('docs.nav.bestPractices') },
])
</script>

<template>
  <!-- Píldoras horizontales en móvil, columna en escritorio -->
  <nav class="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:pb-0">
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors"
      :class="
        route.path === item.to
          ? 'bg-primary-soft font-medium text-primary'
          : 'text-muted hover:bg-surface-2 hover:text-fg'
      "
    >
      <UiIcon :name="item.icon" :size="16" />
      {{ item.label }}
    </NuxtLink>
  </nav>
</template>
