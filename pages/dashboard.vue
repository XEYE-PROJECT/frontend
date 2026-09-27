<script setup lang="ts">
const { t, locale } = useI18n()
const auth = useAuthStore()

const listsApi = useListsApi()
const keysApi = useApiKeysApi()

useHead({ title: () => `${t('dashboard.title')} · XEYE` })

// Dos peticiones: la primera página (grande) de listas trae el nº de elementos de cada una y el
// total; de las claves solo hace falta el total.
const { data, pending } = useAsyncData(
  'dashboard',
  async () => {
    const [listsPage, keysPage] = await Promise.all([
      listsApi.list({ limit: 200 }),
      keysApi.list({ limit: 1 }),
    ])
    return {
      lists: listsPage.items,
      totalLists: listsPage.total,
      totalKeys: keysPage.total,
      totalElements: listsPage.items.reduce((sum, l) => sum + l.elementCount, 0),
    }
  },
  { lazy: true },
)

const lists = computed(() => data.value?.lists ?? [])
const totalLists = computed(() => data.value?.totalLists ?? 0)
const totalKeys = computed(() => data.value?.totalKeys ?? 0)
const totalElements = computed(() => data.value?.totalElements ?? 0)
const publicCount = computed(() => lists.value.filter((l) => l.public).length)

const greeting = computed(() => t('dashboard.greeting', { name: auth.user?.name ?? '' }))

const stats = computed(() => [
  {
    label: t('dashboard.statLists'),
    value: formatNumber(totalLists.value, locale.value),
    icon: 'list',
    tone: 'primary' as const,
  },
  {
    label: t('dashboard.statPublic'),
    value: formatNumber(publicCount.value, locale.value),
    icon: 'globe',
    tone: 'info' as const,
  },
  {
    label: t('dashboard.statKeys'),
    value: formatNumber(totalKeys.value, locale.value),
    icon: 'key',
    tone: 'success' as const,
  },
  {
    label: t('dashboard.statElements'),
    value: formatNumber(totalElements.value, locale.value),
    icon: 'database',
    tone: 'warning' as const,
  },
])

const recentLists = computed(() =>
  [...lists.value]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5),
)

const isEmpty = computed(() => !pending.value && totalLists.value === 0)
</script>

<template>
  <div>
    <AppPageHeader :title="greeting" :subtitle="$t('dashboard.subtitle')" />

    <div class="space-y-8">
      <!-- Estadísticas -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AppStatCard
          v-for="stat in stats"
          :key="stat.label"
          :label="stat.label"
          :value="stat.value"
          :icon="stat.icon"
          :tone="stat.tone"
          :loading="pending"
        />
      </div>

      <!-- Acciones rápidas -->
      <section>
        <h2 class="mb-3 text-sm font-semibold text-fg">{{ $t('dashboard.quickTitle') }}</h2>
        <div class="flex flex-wrap gap-3">
          <UiButton to="/lists" icon="plus">{{ $t('dashboard.quickNewList') }}</UiButton>
          <UiButton to="/api-keys" variant="secondary" icon="key">
            {{ $t('dashboard.quickNewKey') }}
          </UiButton>
          <UiButton to="/search" variant="secondary" icon="search">
            {{ $t('dashboard.quickSearch') }}
          </UiButton>
        </div>
      </section>

      <!-- Listas recientes -->
      <DashboardRecentLists :lists="recentLists" :pending="pending" />

      <!-- Primeros pasos (solo sin listas) -->
      <DashboardGettingStarted v-if="isEmpty" />
    </div>
  </div>
</template>
