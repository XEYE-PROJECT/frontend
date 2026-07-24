<script setup lang="ts">
interface Tab {
  key: string
  label: string
  icon?: string
  badge?: number | string
  /** Puntito de aviso en la pestaña (p. ej. "hay un entrenamiento pendiente"). */
  dot?: boolean
}

defineProps<{ tabs: Tab[] }>()
const model = defineModel<string>()
</script>

<template>
  <div class="flex items-center gap-1 overflow-x-auto border-b border-line">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      class="relative -mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none"
      :class="
        model === tab.key
          ? 'border-primary text-fg'
          : 'border-transparent text-muted hover:text-fg'
      "
      @click="model = tab.key"
    >
      <UiIcon v-if="tab.icon" :name="tab.icon" :size="16" />
      {{ tab.label }}
      <UiBadge v-if="tab.badge != null" :variant="model === tab.key ? 'primary' : 'neutral'">
        {{ tab.badge }}
      </UiBadge>
      <span
        v-if="tab.dot"
        class="h-2 w-2 shrink-0 rounded-full bg-warning"
        aria-hidden="true"
      />
    </button>
  </div>
</template>
