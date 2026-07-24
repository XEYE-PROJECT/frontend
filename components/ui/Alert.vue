<script setup lang="ts">
type Variant = 'info' | 'success' | 'warning' | 'danger'

const props = withDefaults(
  defineProps<{ variant?: Variant; icon?: string; title?: string }>(),
  { variant: 'info' },
)

const styles: Record<Variant, string> = {
  info: 'bg-info-soft text-info',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
}

const defaultIcon: Record<Variant, string> = {
  info: 'info',
  success: 'check-circle',
  warning: 'alert-triangle',
  danger: 'alert-circle',
}
</script>

<template>
  <div class="flex gap-3 rounded-xl border border-current/15 p-3.5 text-sm" :class="styles[props.variant]">
    <UiIcon :name="icon ?? defaultIcon[props.variant]" :size="18" class="mt-0.5 shrink-0" />
    <div class="min-w-0 flex-1">
      <p v-if="title" class="font-medium">{{ title }}</p>
      <div class="text-fg" :class="title && 'mt-0.5'">
        <slot />
      </div>
    </div>
  </div>
</template>
