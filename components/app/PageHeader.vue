<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  backTo?: string
  backLabel?: string
}>()
</script>

<template>
  <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div class="min-w-0">
      <NuxtLink
        v-if="backTo"
        :to="backTo"
        class="mb-2 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-fg"
      >
        <UiIcon name="arrow-left" :size="15" />
        {{ backLabel }}
      </NuxtLink>
      <h1 class="truncate text-2xl font-semibold tracking-tight text-fg">{{ title }}</h1>
      <p v-if="subtitle" class="mt-1 text-sm text-muted">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="flex shrink-0 items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
