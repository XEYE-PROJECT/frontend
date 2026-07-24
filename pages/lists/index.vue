<script setup lang="ts">
import type { ItemList } from '~/types/api'

const { t } = useI18n()
const listsApi = useListsApi()
const trainingsApi = useTrainingsApi()
const toast = useToast()

const { data: lists, pending, refresh } = useAsyncData('lists', () => listsApi.all(), {
  lazy: true,
  default: () => [] as ItemList[],
})

// Las listas con entrenamiento pendiente muestran un aviso en su tarjeta.
const { data: pendingTrainings, refresh: refreshPending } = useAsyncData(
  'pending-trainings',
  () => trainingsApi.pending(),
  { lazy: true, default: () => [] },
)
const pendingListIds = computed(() => new Set(pendingTrainings.value.map((tr) => tr.listId)))

useHead({ title: () => `${t('lists.title')} · XEYE` })

const filter = ref('all')
const query = ref('')

const filterOptions = computed(() => [
  { value: 'all', label: t('lists.filterAll') },
  { value: 'public', label: t('lists.filterPublic') },
  { value: 'private', label: t('lists.filterPrivate') },
])

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return (lists.value ?? []).filter((l) => {
    if (filter.value === 'public' && !l.public) return false
    if (filter.value === 'private' && l.public) return false
    if (q && !`${l.name} ${l.description ?? ''}`.toLowerCase().includes(q)) return false
    return true
  })
})

// Crear / editar
const showForm = ref(false)
const editing = ref<ItemList | undefined>(undefined)

function openCreate() {
  editing.value = undefined
  showForm.value = true
}
function openEdit(list: ItemList) {
  editing.value = list
  showForm.value = true
}
async function onSaved() {
  // Editar la descripción deja un entrenamiento pendiente: refresca ambas cosas.
  await Promise.all([refresh(), refreshPending()])
}

// Borrar
const showDelete = ref(false)
const deleting = ref<ItemList | null>(null)
const removing = ref(false)

function openDelete(list: ItemList) {
  deleting.value = list
  showDelete.value = true
}
async function doDelete() {
  if (!deleting.value) return
  removing.value = true
  try {
    await listsApi.remove(deleting.value.id)
    toast.success(t('lists.deleted'))
    showDelete.value = false
    await refresh()
  } catch (e) {
    toast.error(apiErrorMessage(e, t))
  } finally {
    removing.value = false
  }
}
</script>

<template>
  <div>
    <AppPageHeader :title="$t('lists.title')" :subtitle="$t('lists.subtitle')">
      <template #actions>
        <UiButton icon="plus" @click="openCreate">{{ $t('lists.new') }}</UiButton>
      </template>
    </AppPageHeader>

    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <UiSegmented v-model="filter" :options="filterOptions" />
      <UiInput
        v-model="query"
        icon="search"
        :placeholder="$t('lists.searchPlaceholder')"
        class="sm:w-72"
      />
    </div>

    <!-- Cargando -->
    <div v-if="pending" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <UiCard v-for="n in 6" :key="n" class="h-full">
        <div class="flex flex-col gap-3">
          <UiSkeleton class="h-5 w-2/3" />
          <UiSkeleton class="h-4 w-full" />
          <UiSkeleton class="h-4 w-4/5" />
          <div class="mt-2 flex items-center justify-between">
            <UiSkeleton class="h-5 w-16" rounded="rounded-full" />
            <UiSkeleton class="h-4 w-20" />
          </div>
        </div>
      </UiCard>
    </div>

    <!-- Sin listas -->
    <UiEmptyState
      v-else-if="(lists ?? []).length === 0"
      icon="list"
      :title="$t('lists.emptyTitle')"
      :description="$t('lists.emptyDesc')"
    >
      <UiButton icon="plus" @click="openCreate">{{ $t('lists.emptyCta') }}</UiButton>
    </UiEmptyState>

    <!-- Hay listas pero el filtro no casa con ninguna -->
    <p v-else-if="filtered.length === 0" class="py-16 text-center text-sm text-muted">
      {{ $t('lists.noMatches') }}
    </p>

    <!-- Cuadrícula -->
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <ListsCard
        v-for="list in filtered"
        :key="list.id"
        :list="list"
        :pending-training="pendingListIds.has(list.id)"
        @edit="openEdit(list)"
        @delete="openDelete(list)"
      />
    </div>

    <ListsFormModal v-model="showForm" :list="editing" @saved="onSaved" />

    <UiConfirmDialog
      v-model="showDelete"
      :title="$t('lists.deleteTitle')"
      :message="$t('lists.deleteDesc', { name: deleting?.name ?? '' })"
      :loading="removing"
      @confirm="doDelete"
    />
  </div>
</template>
