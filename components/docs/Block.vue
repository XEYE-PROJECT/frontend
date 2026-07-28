<script setup lang="ts">
withDefaults(defineProps<{ title: string; icon?: string }>(), { icon: 'book-open' })
</script>

<template>
  <UiCard>
    <div class="mb-4 flex items-center gap-2">
      <div class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
        <UiIcon :name="icon" :size="16" />
      </div>
      <h2 class="text-sm font-semibold text-fg">{{ title }}</h2>
    </div>
    <div class="space-y-4 text-sm text-muted">
      <slot />
    </div>
  </UiCard>
</template>
