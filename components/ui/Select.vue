<script setup lang="ts">
interface Option {
  value: string | number
  label: string
  disabled?: boolean
}

const props = defineProps<{
  label?: string
  hint?: string
  error?: string
  icon?: string
  disabled?: boolean
  placeholder?: string
  options?: Option[]
  id?: string
}>()

const model = defineModel<string | number | null>()
const uid = useId()
const selectId = computed(() => props.id ?? uid)
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="selectId" class="text-sm font-medium text-fg">{{ label }}</label>

    <div class="relative">
      <UiIcon
        v-if="icon"
        :name="icon"
        :size="18"
        class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-subtle"
      />
      <select
        :id="selectId"
        v-model="model"
        :disabled="disabled"
        :aria-invalid="error ? 'true' : undefined"
        class="h-10 w-full cursor-pointer appearance-none rounded-lg border bg-surface pr-9 text-sm text-fg transition-theme focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-primary disabled:opacity-60"
        :class="[icon ? 'pl-10' : 'pl-3', error ? 'border-danger' : 'border-line hover:border-line-strong']"
      >
        <option v-if="placeholder" :value="null" disabled>{{ placeholder }}</option>
        <template v-if="options">
          <option
            v-for="opt in options"
            :key="opt.value"
            :value="opt.value"
            :disabled="opt.disabled"
          >
            {{ opt.label }}
          </option>
        </template>
        <slot />
      </select>
      <UiIcon
        name="chevron-down"
        :size="16"
        class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-subtle"
      />
    </div>

    <p v-if="error" class="text-xs text-danger">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-subtle">{{ hint }}</p>
  </div>
</template>
