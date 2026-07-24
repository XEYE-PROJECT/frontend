<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  to: string
  icon: string
  label: string
}>()

const route = useRoute()
const isActive = computed(
  () => route.path === props.to || route.path.startsWith(`${props.to}/`),
)
const target = computed<RouteLocationRaw>(() => props.to)
</script>

<template>
  <NuxtLink
    :to="target"
    class="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
    :class="
      isActive
        ? 'bg-primary-soft text-primary'
        : 'text-muted hover:bg-surface-2 hover:text-fg'
    "
  >
    <UiIcon
      :name="icon"
      :size="18"
      :class="isActive ? '' : 'text-subtle group-hover:text-fg'"
    />
    <span>{{ label }}</span>
  </NuxtLink>
</template>
