<template>
  <div class="relative min-h-screen bg-bg lg:grid lg:grid-cols-2">
    <div class="absolute top-4 right-4 z-10 flex items-center gap-1">
      <UiButton variant="ghost" size="sm" icon="book-open" to="/docs">
        {{ $t('nav.docs') }}
      </UiButton>
      <UiThemeToggle />
      <UiLangSwitcher />
    </div>

    <!-- Hero de marca (solo escritorio) -->
    <aside
      class="bg-brand-gradient relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between"
    >
      <div class="bg-grid pointer-events-none absolute inset-0 opacity-20" />
      <span class="relative inline-flex items-center gap-2.5">
        <span class="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur-sm">
          <UiIcon name="eye" :size="20" />
        </span>
        <span class="text-xl font-semibold tracking-tight">XEYE</span>
      </span>

      <div class="relative max-w-md">
        <h2 class="text-3xl font-semibold tracking-tight text-balance">
          {{ $t('auth.heroTitle') }}
        </h2>
        <p class="mt-4 text-base text-white/80">{{ $t('auth.heroSubtitle') }}</p>
      </div>

      <div class="relative flex items-center gap-6 text-sm text-white/70">
        <span class="inline-flex items-center gap-2"><UiIcon name="sparkles" :size="16" /> Semantic</span>
        <span class="inline-flex items-center gap-2"><UiIcon name="zap" :size="16" /> Fuzzy</span>
        <span class="inline-flex items-center gap-2"><UiIcon name="key" :size="16" /> API-first</span>
      </div>
    </aside>

    <!-- Columna del formulario -->
    <main class="flex min-h-screen items-center justify-center p-6">
      <div class="w-full max-w-sm">
        <slot />
      </div>
    </main>
  </div>
</template>
