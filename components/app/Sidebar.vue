<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })
const { t } = useI18n()
const route = useRoute()

const nav = computed(() => [
  { to: '/dashboard', icon: 'grid', label: t('nav.dashboard') },
  { to: '/lists', icon: 'list', label: t('nav.lists') },
  { to: '/api-keys', icon: 'key', label: t('nav.apiKeys') },
  { to: '/search', icon: 'search', label: t('nav.search') },
  { to: '/docs', icon: 'book-open', label: t('nav.docs') },
  { to: '/account', icon: 'user', label: t('nav.account') },
])

// Cierra el cajón móvil al cambiar de ruta.
watch(
  () => route.fullPath,
  () => {
    open.value = false
  },
)
</script>

<template>
  <!-- Barra lateral de escritorio -->
  <aside
    class="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface lg:flex"
  >
    <div class="flex h-16 items-center px-5">
      <NuxtLink to="/dashboard" class="rounded-lg focus-visible:outline-none">
        <UiLogo />
      </NuxtLink>
    </div>
    <nav class="flex-1 space-y-1 px-3 py-4">
      <AppNavItem v-for="item in nav" :key="item.to" v-bind="item" />
    </nav>
    <div class="px-5 py-4">
      <p class="text-xs text-subtle">{{ $t('auth.heroTitle') }}</p>
    </div>
  </aside>

  <!-- Cajón móvil -->
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="open" class="fixed inset-0 z-50 lg:hidden">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="open = false" />
        <aside
          class="drawer-panel absolute inset-y-0 left-0 flex w-72 flex-col border-r border-line bg-surface"
        >
          <div class="flex h-16 items-center justify-between px-5">
            <UiLogo />
            <UiButton
              variant="ghost"
              size="icon-sm"
              icon="x"
              :aria-label="$t('common.close')"
              @click="open = false"
            />
          </div>
          <nav class="flex-1 space-y-1 px-3 py-4">
            <AppNavItem v-for="item in nav" :key="item.to" v-bind="item" />
          </nav>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-active .drawer-panel,
.drawer-leave-active .drawer-panel {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from .drawer-panel,
.drawer-leave-to .drawer-panel {
  transform: translateX(-100%);
}
</style>
