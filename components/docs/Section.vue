<script setup lang="ts">
defineProps<{
  /** Número de paso dentro de la guía (1..n). */
  step: number
  icon: string
  title: string
  intro?: string
  steps: string[]
  tip?: string
}>()
</script>

<template>
  <UiCard>
    <div class="mb-4 flex items-center gap-3">
      <div class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
        <UiIcon :name="icon" :size="18" />
      </div>
      <div class="min-w-0">
        <p class="text-xs font-medium uppercase tracking-wide text-subtle">
          {{ $t('docs.stepLabel', { n: step }) }}
        </p>
        <h2 class="text-base font-semibold text-fg">{{ title }}</h2>
      </div>
    </div>

    <p v-if="intro" class="mb-4 text-sm text-muted">{{ intro }}</p>

    <ol class="space-y-3">
      <li v-for="(item, i) in steps" :key="i" class="flex items-start gap-3">
        <span
          class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-semibold text-muted"
        >
          {{ i + 1 }}
        </span>
        <p class="pt-0.5 text-sm text-muted">{{ item }}</p>
      </li>
    </ol>

    <UiAlert v-if="tip" variant="info" class="mt-4">{{ tip }}</UiAlert>
  </UiCard>
</template>
