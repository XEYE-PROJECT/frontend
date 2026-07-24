<script setup lang="ts">
type Variant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: 'sm' | 'md'
    dot?: boolean
    icon?: string
  }>(),
  { variant: 'neutral', size: 'sm' },
)

const variants: Record<Variant, string> = {
  neutral: 'bg-surface-2 text-muted',
  primary: 'bg-primary-soft text-primary',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
}

const dotColor: Record<Variant, string> = {
  neutral: 'bg-subtle',
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap"
    :class="[variants[variant], size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs']"
  >
    <span v-if="dot" class="h-1.5 w-1.5 rounded-full" :class="dotColor[variant]" />
    <UiIcon v-else-if="icon" :name="icon" :size="13" />
    <slot />
  </span>
</template>
