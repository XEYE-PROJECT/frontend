<script setup lang="ts">
defineProps<{ question: string; answer: string }>()
</script>

<template>
  <details class="faq group rounded-xl border border-line bg-surface">
    <summary
      class="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-fg"
    >
      {{ question }}
      <UiIcon
        name="chevron-down"
        :size="16"
        class="shrink-0 text-subtle transition-transform group-open:rotate-180"
      />
    </summary>
    <p class="px-4 pb-4 text-sm text-muted">{{ answer }}</p>
  </details>
</template>

<style scoped>
.faq summary::-webkit-details-marker {
  display: none;
}
</style>
