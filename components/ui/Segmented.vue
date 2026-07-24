<script setup lang="ts">
interface Option {
  value: string
  label: string
  icon?: string
}

defineProps<{ options: Option[] }>()
const model = defineModel<string>()
</script>

<template>
  <div class="inline-flex items-center gap-1 rounded-lg border border-line bg-surface-2 p-1">
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      class="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none"
      :class="
        model === opt.value
          ? 'bg-surface text-fg shadow-soft'
          : 'text-muted hover:text-fg'
      "
      @click="model = opt.value"
    >
      <UiIcon v-if="opt.icon" :name="opt.icon" :size="15" />
      {{ opt.label }}
    </button>
  </div>
</template>
