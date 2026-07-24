<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string }>(), { size: 18 })
</script>

<template>
  <UiIcon name="loader" :size="size" class="animate-spin" />
</template>
