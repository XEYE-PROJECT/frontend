<script setup lang="ts">
const { t } = useI18n()

const steps = computed(() => [
  t('dashboard.step1'),
  t('dashboard.step2'),
  t('dashboard.step3'),
  t('dashboard.step4'),
])
</script>

<template>
  <UiCard>
    <div class="mb-4 flex items-center gap-2">
      <div class="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary">
        <UiIcon name="sparkles" :size="16" />
      </div>
      <h2 class="text-sm font-semibold text-fg">{{ $t('dashboard.gettingStartedTitle') }}</h2>
    </div>

    <ol class="space-y-3">
      <li v-for="(step, i) in steps" :key="i" class="flex items-start gap-3">
        <span
          class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-semibold text-muted"
        >
          {{ i + 1 }}
        </span>
        <p class="pt-0.5 text-sm text-muted">{{ step }}</p>
      </li>
    </ol>
  </UiCard>
</template>
