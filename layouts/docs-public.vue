<template>
  <!-- Chrome público de la documentación (visitantes sin sesión). -->
  <div class="min-h-screen bg-bg">
    <header
      class="glass sticky top-0 z-20 flex h-16 items-center justify-between gap-2 border-b border-line px-4 sm:px-6"
    >
      <NuxtLink to="/docs" class="rounded-lg focus-visible:outline-none">
        <UiLogo />
      </NuxtLink>
      <div class="flex items-center gap-1">
        <UiThemeToggle />
        <UiLangSwitcher />
        <div class="mx-1 h-6 w-px bg-line" />
        <UiButton variant="ghost" size="sm" to="/login">{{ $t('auth.signIn') }}</UiButton>
        <UiButton size="sm" to="/register" class="hidden sm:inline-flex">
          {{ $t('auth.signUp') }}
        </UiButton>
      </div>
    </header>
    <main class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <slot />
    </main>
  </div>
</template>
