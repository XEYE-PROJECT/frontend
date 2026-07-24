<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    message?: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'danger' | 'primary'
    icon?: string
    loading?: boolean
  }>(),
  { variant: 'danger', icon: 'alert-triangle' },
)

const emit = defineEmits<{ confirm: [] }>()
const open = defineModel<boolean>({ default: false })
</script>

<template>
  <UiModal v-model="open" :title="title" size="sm">
    <div class="flex gap-3">
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        :class="variant === 'danger' ? 'bg-danger-soft text-danger' : 'bg-primary-soft text-primary'"
      >
        <UiIcon :name="icon" :size="20" />
      </div>
      <p class="pt-1.5 text-sm text-muted">
        <slot>{{ message }}</slot>
      </p>
    </div>

    <template #footer>
      <UiButton variant="ghost" :disabled="loading" @click="open = false">
        {{ cancelLabel ?? $t('common.cancel') }}
      </UiButton>
      <UiButton :variant="variant" :loading="loading" @click="emit('confirm')">
        {{ confirmLabel ?? $t('common.confirm') }}
      </UiButton>
    </template>
  </UiModal>
</template>
