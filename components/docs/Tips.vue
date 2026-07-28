<script setup lang="ts">
const props = defineProps<{
  /** Título de la tarjeta; por defecto «Recomendaciones». */
  title?: string
  icon?: string
  items: string[]
}>()

const { t } = useI18n()
const heading = computed(() => props.title ?? t('docs.recTitle'))
</script>

<template>
  <UiCard>
    <div class="mb-4 flex items-center gap-2">
      <div class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-success-soft text-success">
        <UiIcon :name="icon ?? 'check-circle'" :size="16" />
      </div>
      <h2 class="text-sm font-semibold text-fg">{{ heading }}</h2>
    </div>
    <ul class="space-y-3">
      <li v-for="item in items" :key="item" class="flex items-start gap-3">
        <UiIcon name="check" :size="15" class="mt-0.5 shrink-0 text-success" />
        <p class="text-sm text-muted">{{ item }}</p>
      </li>
    </ul>
  </UiCard>
</template>
