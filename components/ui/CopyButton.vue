<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    text: string
    label?: string
    variant?: 'secondary' | 'ghost' | 'outline'
    size?: 'sm' | 'md'
  }>(),
  { variant: 'secondary', size: 'md' },
)

const { copied, copy } = useClipboard()
const { t } = useI18n()

const buttonLabel = computed(() =>
  copied.value ? t('common.copied') : (props.label ?? t('common.copy')),
)
</script>

<template>
  <UiButton
    :variant="variant"
    :size="size"
    :icon="copied ? 'check' : 'copy'"
    @click="copy(text)"
  >
    <slot>{{ buttonLabel }}</slot>
  </UiButton>
</template>
