<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: string
    padded?: boolean
    hover?: boolean
  }>(),
  { as: 'div', padded: true, hover: false },
)
</script>

<template>
  <component
    :is="as"
    class="rounded-2xl border border-line bg-surface shadow-soft transition-theme"
    :class="[padded && 'p-5', hover && 'hover:border-line-strong hover:shadow-pop']"
  >
    <slot />
  </component>
</template>
