<script setup lang="ts">
// Placeholder con brillo; el tamaño se pasa por clase, p. ej. <UiSkeleton class="h-4 w-32" />.
withDefaults(defineProps<{ rounded?: string }>(), { rounded: 'rounded-md' })
</script>

<template>
  <div class="skeleton" :class="rounded" />
</template>
