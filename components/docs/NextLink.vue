<script setup lang="ts">
defineProps<{ to: string; label: string }>()

const { t } = useI18n()
</script>

<template>
  <div class="flex justify-end">
    <NuxtLink
      :to="to"
      class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary-soft"
    >
      {{ t('docs.nextLabel') }}: {{ label }}
      <UiIcon name="arrow-right" :size="16" />
    </NuxtLink>
  </div>
</template>
