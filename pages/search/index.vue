<script setup lang="ts">
import type { ConsoleSearchResponse } from '~/types/api'

const { t } = useI18n()
const route = useRoute()

useHead({ title: () => `${t('search.title')} · XEYE` })

const listsApi = useListsApi()
const searchApi = useSearchApi()

// El playground busca a través del backend con tu sesión (POST /lists/{id}/search): no hace
// falta clave API en el navegador y se pueden probar también las listas privadas.
const { data, pending } = useAsyncData(
  'search-setup',
  async () => {
    const lists = await listsApi.all()
    return { lists }
  },
  { lazy: true },
)

const lists = computed(() => data.value?.lists ?? [])
const hasLists = computed(() => lists.value.length > 0)

const listOptions = computed(() =>
  lists.value.map((l) => ({
    value: l.id,
    label: l.public ? l.name : `${l.name} · ${t('search.privateTag')}`,
  })),
)
const limitOptions = [
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 50, label: '50' },
]

const form = reactive({
  listId: 0,
  term: '',
  limit: 10,
  breakdown: true,
})

const loading = ref(false)
const errorMsg = ref('')
const result = ref<ConsoleSearchResponse | null>(null)

// El buscador avisa cuando ha servido con menos calidad (sin embeddings, modelo caído, datos
// caducos…): se muestra el motivo para que el usuario sepa si fiarse del ranking.
const degradedMsg = computed(() => {
  if (!result.value?.degraded) return ''
  const reasons = (result.value.degradationReasons ?? []).map((r) => t(`search.degradedReasons.${r}`))
  return t('search.degradedWarning', { reasons: reasons.join('; ') })
})

// Preselecciona la primera lista al cargar, respetando ?list=<nombre>.
watch(
  data,
  (d) => {
    if (!d) return
    if (!form.listId && d.lists.length) {
      const wanted = route.query.list as string | undefined
      const match = wanted ? d.lists.find((l) => l.name === wanted) : undefined
      form.listId = match ? match.id : d.lists[0].id
    }
  },
  { immediate: true },
)

async function run() {
  loading.value = true
  errorMsg.value = ''
  try {
    result.value = await searchApi.search(form.listId, {
      searchTerm: form.term,
      limit: form.limit,
      includeScoreBreakdown: form.breakdown,
    })
  } catch (e) {
    const s = errorStatus(e)
    errorMsg.value =
      s === 404
        ? t('search.errNotFound')
        : s === 429
          ? t('search.errRateLimit', { seconds: retryAfterSeconds(e) ?? 60 })
          : s === 503
            ? t('search.errUnavailable')
            : apiErrorMessage(e, t)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <AppPageHeader :title="$t('search.title')" :subtitle="$t('search.subtitle')">
      <template #actions>
        <UiBadge variant="primary" icon="zap">{{ $t('search.consoleBadge') }}</UiBadge>
      </template>
    </AppPageHeader>

    <!-- Skeleton de carga -->
    <UiCard v-if="pending">
      <div class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <UiSkeleton class="h-10 w-full" />
          <UiSkeleton class="h-10 w-full" />
        </div>
        <UiSkeleton class="h-10 w-full" />
        <UiSkeleton class="h-10 w-32" />
      </div>
    </UiCard>

    <template v-else>
      <UiAlert v-if="!hasLists" variant="info" class="mb-4">
        {{ $t('search.noLists') }}
        <NuxtLink to="/lists" class="font-medium text-primary hover:underline">
          {{ $t('search.createList') }}
        </NuxtLink>
      </UiAlert>

      <!-- Formulario de búsqueda -->
      <UiCard>
        <form class="space-y-4" @submit.prevent="run">
          <div class="grid gap-4 sm:grid-cols-2">
            <UiSelect
              v-model.number="form.listId"
              :label="$t('search.listLabel')"
              :hint="$t('search.listHint')"
              icon="list"
              :options="listOptions"
              :disabled="!hasLists"
            />
            <UiSelect
              v-model.number="form.limit"
              :label="$t('search.limitLabel')"
              :options="limitOptions"
              :disabled="!hasLists"
            />
          </div>

          <UiInput
            v-model="form.term"
            :label="$t('search.termLabel')"
            :placeholder="$t('search.termPlaceholder')"
            icon="search"
            :disabled="!hasLists"
          />

          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <label class="flex cursor-pointer items-center gap-2 text-sm text-fg">
              <input v-model="form.breakdown" type="checkbox" class="accent-primary" :disabled="!hasLists" />
              <span>{{ $t('search.breakdownToggle') }}</span>
            </label>
            <UiButton
              type="submit"
              icon="search"
              :loading="loading"
              :disabled="!hasLists || !form.listId || !form.term.trim()"
            >
              {{ loading ? $t('search.running') : $t('search.run') }}
            </UiButton>
          </div>
        </form>
      </UiCard>

      <!-- Resultados -->
      <div class="mt-8 space-y-4">
        <UiAlert v-if="errorMsg" variant="danger">{{ errorMsg }}</UiAlert>
        <UiAlert v-else-if="degradedMsg" variant="warning">{{ degradedMsg }}</UiAlert>

        <template v-if="result && result.results.length">
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <h2 class="text-lg font-semibold text-fg">{{ $t('search.resultsTitle') }}</h2>
            <p class="text-sm text-muted">
              {{ $t('search.resultsMeta', { total: result.totalResults, ms: result.durationMs }) }}
            </p>
          </div>
          <div class="space-y-3">
            <SearchResultCard v-for="(r, i) in result.results" :key="i" :result="r" />
          </div>
        </template>

        <UiEmptyState
          v-else-if="result"
          icon="search"
          :title="$t('search.noResults', { term: result.searchTerm })"
        />

        <UiEmptyState
          v-else-if="!errorMsg"
          icon="sparkles"
          :title="$t('search.emptyTitle')"
          :description="$t('search.emptyDesc')"
        />
      </div>

      <p class="mt-6 text-xs text-subtle">
        {{ $t('search.apiNote') }}
        <NuxtLink to="/docs/api" class="text-primary hover:underline">{{ $t('search.apiNoteLink') }}</NuxtLink>
      </p>
    </template>
  </div>
</template>
