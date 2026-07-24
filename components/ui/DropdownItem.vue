<script setup lang="ts">
defineProps<{ icon?: string; danger?: boolean; disabled?: boolean }>()
const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors disabled:pointer-events-none disabled:opacity-50"
    :class="danger ? 'text-danger hover:bg-danger-soft' : 'text-fg hover:bg-surface-2'"
    @click="emit('click')"
  >
    <UiIcon v-if="icon" :name="icon" :size="16" :class="danger ? '' : 'text-muted'" />
    <slot />
  </button>
</template>
