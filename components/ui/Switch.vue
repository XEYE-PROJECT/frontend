<script setup lang="ts">
const props = defineProps<{
  label?: string
  description?: string
  disabled?: boolean
  id?: string
}>()

const model = defineModel<boolean>({ default: false })
const uid = useId()
const switchId = computed(() => props.id ?? uid)

function toggle() {
  if (!props.disabled) model.value = !model.value
}
</script>

<template>
  <div class="flex items-start gap-3">
    <button
      :id="switchId"
      type="button"
      role="switch"
      :aria-checked="model"
      :disabled="disabled"
      class="mt-0.5 inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50"
      :class="model ? 'bg-primary' : 'bg-surface-3'"
      @click="toggle"
    >
      <span
        class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
        :class="model ? 'translate-x-4' : 'translate-x-0.5'"
      />
    </button>

    <div v-if="label || description" class="min-w-0 flex-1">
      <label :for="switchId" class="block cursor-pointer text-sm font-medium text-fg">
        {{ label }}
      </label>
      <p v-if="description" class="mt-0.5 text-xs text-subtle">{{ description }}</p>
    </div>
  </div>
</template>
