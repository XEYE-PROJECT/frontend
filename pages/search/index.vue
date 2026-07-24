<script setup lang="ts">
import type { SearchResponse } from '~/types/api'

const { t } = useI18n()
const route = useRoute()

useHead({ title: () => `${t('search.title')} · XEYE` })

const keysApi = useApiKeysApi()
const listsApi = useListsApi()
const searchApi = useSearchApi()

const { data, pending } = useAsyncData(
  'search-setup',
  async () => {
    const [keys, lists] = await Promise.all([keysApi.all(), listsApi.all()])
    return { keys, lists }
  },
  { lazy: true },
)

const keys = computed(() => data.value?.keys ?? [])
const lists = computed(() => data.value?.lists ?? [])

const hasKeys = computed(() => keys.value.length > 0)
const hasLists = computed(() => lists.value.length > 0)
const canSearch = computed(() => hasKeys.value && hasLists.value)

const keyOptions = computed(() => keys.value.map((k) => ({ value: k.apiKey, label: k.name })))
const listOptions = computed(() => lists.value.map((l) => ({ value: l.name, label: l.name })))
const limitOptions = [
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 50, label: '50' },
]

const form = reactive({
  key: '',
  list: '',
  term: '',
  limit: 10,
})

const loading = ref(false)
const errorMsg = ref('')
const result = ref<SearchResponse | null>(null)

// Preselecciona la primera clave y lista al cargar, respetando ?list=<nombre>.
watch(
  data,
  (d) => {
    if (!d) return
    if (!form.key && d.keys.length) form.key = d.keys[0].apiKey
    if (!form.list && d.lists.length) {
      const wanted = route.query.list as string | undefined
      const match = wanted ? d.lists.find((l) => l.name === wanted) : undefined
      form.list = match ? match.name : d.lists[0].name
    }
  },
  { immediate: true },
)

async function run() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await searchApi.search(form.key, {
      list_name: form.list,
      search_term: form.term,
      limit: form.limit,
    })
    result.value = res
  } catch (e) {
    const s = errorStatus(e)
    errorMsg.value =
      s === 401
        ? t('search.errInvalidKey')
        : s === 403
          ? t('search.errNotPublic')
          : s === 404
            ? t('search.errNotFound')
            : s === 429
              ? t('search.errRateLimit')
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
        <UiBadge variant="primary" icon="zap">{{ $t('search.directBadge') }}</UiBadge>
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
      <!-- Avisos de requisitos previos -->
      <UiAlert v-if="!hasKeys" variant="warning" class="mb-4">
        {{ $t('search.noKeys') }}
        <NuxtLink to="/api-keys" class="font-medium text-primary hover:underline">
          {{ $t('search.createKey') }}
        </NuxtLink>
      </UiAlert>
      <UiAlert v-else-if="!hasLists" variant="info" class="mb-4">
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
              v-model="form.key"
              :label="$t('search.keyLabel')"
              :hint="$t('search.keyHint')"
              icon="key"
              :options="keyOptions"
              :disabled="!canSearch"
            />
            <UiSelect
              v-model="form.list"
              :label="$t('search.listLabel')"
              :hint="$t('search.listHint')"
              icon="list"
              :options="listOptions"
              :disabled="!canSearch"
            />
          </div>

          <UiInput
            v-model="form.term"
            :label="$t('search.termLabel')"
            :placeholder="$t('search.termPlaceholder')"
            icon="search"
            :disabled="!canSearch"
          />

          <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <UiSelect
              v-model.number="form.limit"
              :label="$t('search.limitLabel')"
              :options="limitOptions"
              :disabled="!canSearch"
              class="sm:w-32"
            />
            <UiButton
              type="submit"
              icon="search"
              :loading="loading"
              :disabled="!form.key || !form.list || !form.term"
            >
              {{ loading ? $t('search.running') : $t('search.run') }}
            </UiButton>
          </div>
        </form>
      </UiCard>

      <!-- Resultados -->
      <div class="mt-8 space-y-4">
        <UiAlert v-if="errorMsg" variant="danger">{{ errorMsg }}</UiAlert>

        <template v-if="result && result.results.length">
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <h2 class="text-lg font-semibold text-fg">{{ $t('search.resultsTitle') }}</h2>
            <p class="text-sm text-muted">
              {{ $t('search.resultsMeta', { total: result.total_results, ms: result.duration_ms }) }}
            </p>
          </div>
          <div class="space-y-3">
            <SearchResultCard v-for="(r, i) in result.results" :key="i" :result="r" />
          </div>
        </template>

        <UiEmptyState
          v-else-if="result"
          icon="search"
          :title="$t('search.noResults', { term: result.search_term })"
        />

        <UiEmptyState
          v-else-if="!errorMsg"
          icon="sparkles"
          :title="$t('search.emptyTitle')"
          :description="$t('search.emptyDesc')"
        />
      </div>
    </template>
  </div>
</template>
