<script setup lang="ts">
withDefaults(
  defineProps<{
    icon?: string
    title: string
    description?: string
    compact?: boolean
  }>(),
  { icon: 'sparkles' },
)
</script>

<template>
  <div
    class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/40 text-center"
    :class="compact ? 'px-6 py-10' : 'px-6 py-16'"
  >
    <div
      class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary"
    >
      <UiIcon :name="icon" :size="24" />
    </div>
    <h3 class="text-base font-semibold text-fg">{{ title }}</h3>
    <p v-if="description" class="mt-1 max-w-sm text-sm text-muted">{{ description }}</p>
    <div v-if="$slots.default" class="mt-5">
      <slot />
    </div>
  </div>
</template>
