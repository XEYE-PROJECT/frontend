<script setup lang="ts">
type Tone = 'primary' | 'success' | 'info' | 'warning'

const props = withDefaults(
  defineProps<{
    label: string
    value: string | number
    icon: string
    tone?: Tone
    loading?: boolean
  }>(),
  { tone: 'primary' },
)

const tones: Record<Tone, string> = {
  primary: 'bg-primary-soft text-primary',
  success: 'bg-success-soft text-success',
  info: 'bg-info-soft text-info',
  warning: 'bg-warning-soft text-warning',
}
</script>

<template>
  <UiCard>
    <div class="flex items-center gap-4">
      <div class="grid h-11 w-11 shrink-0 place-items-center rounded-xl" :class="tones[props.tone]">
        <UiIcon :name="icon" :size="22" />
      </div>
      <div class="min-w-0">
        <UiSkeleton v-if="loading" class="h-7 w-12" />
        <p v-else class="text-2xl font-semibold tracking-tight text-fg">{{ value }}</p>
        <p class="truncate text-sm text-muted">{{ label }}</p>
      </div>
    </div>
  </UiCard>
</template>
