<script setup lang="ts">
const props = defineProps<{
  score: number
  label?: string
}>()

const pct = computed(() => Math.round((props.score ?? 0) * 100))

const barColor = computed(() =>
  props.score >= 0.7 ? 'bg-success' : props.score >= 0.4 ? 'bg-warning' : 'bg-danger',
)
</script>

<template>
  <div class="flex flex-col gap-1">
    <div v-if="label" class="flex items-center justify-between gap-2">
      <span class="text-xs text-subtle">{{ label }}</span>
      <span class="font-mono text-xs tabular-nums text-fg">{{ pct }}%</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
        <div
          class="h-full rounded-full transition-all duration-500 ease-out"
          :class="barColor"
          :style="{ width: pct + '%' }"
        />
      </div>
      <span v-if="!label" class="font-mono text-xs tabular-nums text-muted">{{ pct }}%</span>
    </div>
  </div>
</template>
