<script setup lang="ts">
const mobileNav = ref(false)
</script>

<template>
  <div class="min-h-screen bg-bg">
    <AppSidebar v-model:open="mobileNav" />
    <div class="lg:pl-64">
      <AppTopbar @menu="mobileNav = true" />
      <main class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <slot />
      </main>
    </div>
  </div>
</template>
