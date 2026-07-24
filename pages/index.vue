<script setup lang="ts">
// El middleware global redirige `/` a /dashboard o /login antes de renderizar;
// esto es solo un fallback elegante.
definePageMeta({ layout: false })
</script>

<template>
  <div class="grid min-h-screen place-items-center bg-bg">
    <UiSpinner :size="26" class="text-muted" />
  </div>
</template>
