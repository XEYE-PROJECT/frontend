<script setup lang="ts">
const emit = defineEmits<{ menu: [] }>()
</script>

<template>
  <header
    class="glass sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-line px-4 sm:px-6"
  >
    <UiButton
      variant="ghost"
      size="icon"
      class="lg:hidden"
      :aria-label="$t('nav.dashboard')"
      @click="emit('menu')"
    >
      <UiIcon name="menu" :size="20" />
    </UiButton>

    <div class="flex-1" />

    <UiButton variant="secondary" size="sm" icon="search" to="/search" class="hidden sm:inline-flex">
      {{ $t('nav.search') }}
    </UiButton>
    <UiThemeToggle />
    <UiLangSwitcher />
    <div class="mx-1 h-6 w-px bg-line" />
    <AppUserMenu />
  </header>
</template>
