<script setup lang="ts">
const { t, locale } = useI18n()
const auth = useAuthStore()

const listsApi = useListsApi()
const keysApi = useApiKeysApi()
const elementsApi = useElementsApi()

useHead({ title: () => `${t('dashboard.title')} · XEYE` })

const { data, pending } = useAsyncData(
  'dashboard',
  async () => {
    const [lists, keys] = await Promise.all([listsApi.all(), keysApi.all()])
    const elementCounts = await Promise.all(
      lists.map((l) =>
        elementsApi
          .listByList(l.id)
          .then((e) => e.length)
          .catch(() => 0),
      ),
    )
    return { lists, keys, totalElements: elementCounts.reduce((a, b) => a + b, 0) }
  },
  { lazy: true },
)

const lists = computed(() => data.value?.lists ?? [])
const keys = computed(() => data.value?.keys ?? [])
const totalElements = computed(() => data.value?.totalElements ?? 0)
const publicCount = computed(() => lists.value.filter((l) => l.public).length)

const greeting = computed(() => t('dashboard.greeting', { name: auth.user?.name ?? '' }))

const stats = computed(() => [
  {
    label: t('dashboard.statLists'),
    value: formatNumber(lists.value.length, locale.value),
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
    value: formatNumber(keys.value.length, locale.value),
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

const isEmpty = computed(() => !pending.value && lists.value.length === 0)
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
