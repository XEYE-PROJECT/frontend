<script setup lang="ts">
const props = defineProps<{
  label?: string
  hint?: string
  error?: string
  placeholder?: string
  rows?: number
  required?: boolean
  disabled?: boolean
  mono?: boolean
  id?: string
}>()

const model = defineModel<string>()
const uid = useId()
const inputId = computed(() => props.id ?? uid)
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="inputId" class="text-sm font-medium text-fg">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>

    <textarea
      :id="inputId"
      v-model="model"
      :rows="rows ?? 3"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :aria-invalid="error ? 'true' : undefined"
      class="w-full resize-y rounded-lg border bg-surface px-3 py-2 text-sm text-fg transition-theme placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-primary disabled:opacity-60"
      :class="[mono && 'font-mono text-[13px] leading-relaxed', error ? 'border-danger' : 'border-line hover:border-line-strong']"
    />

    <p v-if="error" class="text-xs text-danger">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-subtle">{{ hint }}</p>
  </div>
</template>
