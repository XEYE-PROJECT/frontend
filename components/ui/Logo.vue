<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    size?: number
    withText?: boolean
  }>(),
  { size: 32, withText: true },
)

const iconSize = computed(() => Math.round(props.size * 0.58))
</script>

<template>
  <span class="inline-flex items-center gap-2.5">
    <span
      class="bg-brand-gradient grid place-items-center rounded-xl text-white shadow-soft"
      :style="{ width: `${size}px`, height: `${size}px` }"
    >
      <UiIcon name="eye" :size="iconSize" />
    </span>
    <span v-if="withText" class="text-lg font-semibold tracking-tight text-fg">XEYE</span>
  </span>
</template>
