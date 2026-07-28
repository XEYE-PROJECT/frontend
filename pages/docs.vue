<script setup lang="ts">
// La documentación es pública: con sesión usa el layout normal de la consola,
// sin sesión un chrome propio con acceso a login/registro.
definePageMeta({ layout: false })

const auth = useAuthStore()
const { t } = useI18n()

useHead({ title: () => `${t('docs.title')} · XEYE` })

const layout = computed(() => (auth.isAuthenticated ? 'default' : 'docs-public'))
</script>

<template>
  <NuxtLayout :name="layout">
    <div>
      <AppPageHeader :title="$t('docs.title')" :subtitle="$t('docs.subtitle')" />

      <div class="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <aside class="lg:w-56 lg:shrink-0">
          <div class="lg:sticky lg:top-20">
            <DocsNav />
          </div>
        </aside>
        <div class="min-w-0 flex-1">
          <NuxtPage />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
