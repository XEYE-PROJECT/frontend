<script setup lang="ts">
const props = defineProps<{
  label?: string
  hint?: string
  error?: string
  type?: string
  placeholder?: string
  icon?: string
  required?: boolean
  disabled?: boolean
  autocomplete?: string
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

    <div class="relative">
      <UiIcon
        v-if="icon"
        :name="icon"
        :size="18"
        class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-subtle"
      />
      <input
        :id="inputId"
        v-model="model"
        :type="type ?? 'text'"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :aria-invalid="error ? 'true' : undefined"
        class="h-10 w-full rounded-lg border bg-surface px-3 text-sm text-fg transition-theme placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-primary disabled:opacity-60"
        :class="[icon && 'pl-10', error ? 'border-danger' : 'border-line hover:border-line-strong']"
      />
    </div>

    <p v-if="error" class="text-xs text-danger">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-subtle">{{ hint }}</p>
  </div>
</template>
