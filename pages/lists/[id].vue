<script setup lang="ts">
import type { Element, ImportElementItem, Training } from '~/types/api'

const route = useRoute()
const id = Number(route.params.id)

const { t, locale } = useI18n()
const toast = useToast()
const listsApi = useListsApi()
const elementsApi = useElementsApi()
const trainingsApi = useTrainingsApi()

const {
  data: list,
  error: listError,
  refresh: refreshList,
} = useAsyncData('list-' + id, () => listsApi.get(id), { lazy: true })

const {
  data: elements,
  pending: elementsPending,
  refresh: refreshElements,
} = useAsyncData('list-elements-' + id, () => elementsApi.listByList(id), {
  lazy: true,
  default: () => [] as Element[],
})

const {
  data: trainings,
  pending: trainingsPending,
  refresh: refreshTrainings,
} = useAsyncData('list-trainings-' + id, () => trainingsApi.listByList(id), {
  lazy: true,
  default: () => [] as Training[],
})

const { data: embeddingModels } = useAsyncData(
  'embedding-models',
  () => trainingsApi.embeddingModels(),
  { lazy: true, default: () => ({ models: [] as string[], defaultModel: null }) },
)

// Regenerar todas las descripciones IA al entrenar (ignora la caché): lo marca el usuario
// en la caja de lanzamiento y encarece la estimación (todas las descripciones cuentan).
const regenerateDescriptions = ref(false)

// Precio preestablecido de lanzar ahora; depende de qué elementos tienen ya descripción
// cacheada, así que se recalcula cada vez que se recargan los elementos (el watch salta
// con cada refreshElements: tras editar, importar o lanzar) o cambia el check de regenerar.
const { data: costEstimate } = useAsyncData(
  'list-training-estimate-' + id,
  () => trainingsApi.estimate(id, regenerateDescriptions.value),
  { lazy: true, watch: [elements, regenerateDescriptions] },
)

useHead({ title: () => `${list.value?.name ?? t('listDetail.tabElements')} · XEYE` })

const tab = ref('elements')

// Una lista tiene como mucho un entrenamiento pendiente; se pinta como caja de lanzamiento, no como historial.
const pendingTraining = computed(() => trainings.value.find((tr) => tr.status === 'pending'))
const historyTrainings = computed(() => trainings.value.filter((tr) => tr.status !== 'pending'))

const tabs = computed(() => [
  { key: 'elements', label: t('listDetail.tabElements'), icon: 'box', badge: elements.value.length },
  {
    key: 'trainings',
    label: t('listDetail.tabTrainings'),
    icon: 'sparkles',
    badge: trainings.value.length,
    dot: !!pendingTraining.value,
  },
  { key: 'settings', label: t('listDetail.tabSettings'), icon: 'settings' },
])

// Entrenamientos: lanzar/reentrenar — siempre vía retrain de lista, que reutiliza
// el entrenamiento pendiente si una edición dejó uno o crea otro si la lista está al día.
const launching = ref(false)

async function launchTraining(model: string | null) {
  launching.value = true
  try {
    const result = await trainingsApi.retrain(id, {
      embeddingModel: model,
      regenerateDescriptions: regenerateDescriptions.value,
    })
    if (result.status === 'failed') {
      toast.error(result.error ?? t('trainings.launchFailed'))
    } else {
      toast.success(t('trainings.launched'))
      // Regenerar es una decisión por lanzamiento: se desmarca para el siguiente.
      regenerateDescriptions.value = false
    }
    // El lanzamiento marca todos los elementos como no entrenados: cambian ambas vistas
    // (y el refresco de elementos re-dispara la estimación de precio vía su watch).
    await Promise.all([refreshTrainings(), refreshElements()])
  } catch (e) {
    toast.error(apiErrorMessage(e, t))
  } finally {
    launching.value = false
  }
}

// Cambiar el entrenamiento en uso (solo los que cubren los elementos actuales de la lista).
const switchingTrainingId = ref<number | null>(null)

async function useTraining(trainingId: number) {
  switchingTrainingId.value = trainingId
  try {
    await trainingsApi.use(trainingId)
    toast.success(t('trainings.useSuccess'))
    await refreshTrainings()
  } catch (e) {
    toast.error(apiErrorMessage(e, t))
  } finally {
    switchingTrainingId.value = null
  }
}

// Elementos: filtro
const elementFilter = ref('')
const filteredElements = computed(() => {
  const q = elementFilter.value.trim().toLowerCase()
  if (!q) return elements.value
  return elements.value.filter(
    (el) =>
      el.text.toLowerCase().includes(q) ||
      (el.description ?? '').toLowerCase().includes(q),
  )
})

// Elementos: paginación
const ELEMENTS_PAGE_SIZE = 25
const elementsPage = shallowRef(1)
const elementsPageCount = computed(() =>
  Math.max(1, Math.ceil(filteredElements.value.length / ELEMENTS_PAGE_SIZE)),
)
const pagedElements = computed(() =>
  filteredElements.value.slice(
    (elementsPage.value - 1) * ELEMENTS_PAGE_SIZE,
    elementsPage.value * ELEMENTS_PAGE_SIZE,
  ),
)

// Filtro nuevo → primera página; menos páginas (p. ej. tras borrar) → se acota.
watch(elementFilter, () => {
  elementsPage.value = 1
})
watch(elementsPageCount, (count) => {
  if (elementsPage.value > count) elementsPage.value = count
})

// Elementos: modal de crear / editar
const elModalOpen = ref(false)
const editingEl = ref<Element | undefined>(undefined)

function addElement() {
  editingEl.value = undefined
  elModalOpen.value = true
}
function editElement(el: Element) {
  editingEl.value = el
  elModalOpen.value = true
}

// Elementos: importar desde fichero
const importing = ref(false)

async function importElements(items: ImportElementItem[]) {
  importing.value = true
  try {
    await elementsApi.importElements(id, { elements: items })
    toast.success(t('elements.imported', { count: items.length }))
    await Promise.all([refreshElements(), refreshTrainings()])
  } catch (e) {
    toast.error(apiErrorMessage(e, t))
  } finally {
    importing.value = false
  }
}

// Elementos: borrar
const deleteElOpen = ref(false)
const deletingEl = ref<Element | null>(null)
const deletingElBusy = ref(false)

function askDeleteElement(el: Element) {
  deletingEl.value = el
  deleteElOpen.value = true
}
async function confirmDeleteElement() {
  if (!deletingEl.value) return
  deletingElBusy.value = true
  try {
    await elementsApi.remove(deletingEl.value.id)
    toast.success(t('elements.deleted'))
    deleteElOpen.value = false
    await refreshElements()
  } catch (e) {
    toast.error(apiErrorMessage(e, t))
  } finally {
    deletingElBusy.value = false
  }
}

// Ajustes: editar lista
const settingsForm = reactive({ name: '', description: '', public: false })
const savingSettings = ref(false)

watch(
  list,
  (l) => {
    if (l) {
      settingsForm.name = l.name
      settingsForm.description = l.description ?? ''
      settingsForm.public = l.public
    }
  },
  { immediate: true },
)

async function saveSettings() {
  if (!settingsForm.name.trim()) return
  savingSettings.value = true
  try {
    await listsApi.update(id, {
      name: settingsForm.name.trim(),
      description: settingsForm.description.trim() ? settingsForm.description.trim() : null,
      public: settingsForm.public,
    })
    toast.success(t('lists.updated'))
    await refreshList()
  } catch (e) {
    toast.error(apiErrorMessage(e, t))
  } finally {
    savingSettings.value = false
  }
}

// Ajustes: borrar lista
const deleteListOpen = ref(false)
const deletingList = ref(false)

async function confirmDeleteList() {
  deletingList.value = true
  try {
    await listsApi.remove(id)
    toast.success(t('lists.deleted'))
    await navigateTo('/lists')
  } catch (e) {
    toast.error(apiErrorMessage(e, t))
    deletingList.value = false
  }
}
</script>

<template>
  <div>
    <!-- No encontrada -->
    <template v-if="listError">
      <AppPageHeader
        :title="$t('notFound.title')"
        backTo="/lists"
        :backLabel="$t('listDetail.backToLists')"
      />
      <UiEmptyState
        icon="alert-triangle"
        :title="$t('errors.notFound')"
        :description="$t('notFound.desc')"
      >
        <UiButton to="/lists" variant="outline" icon="arrow-left">
          {{ $t('listDetail.backToLists') }}
        </UiButton>
      </UiEmptyState>
    </template>

    <template v-else>
      <AppPageHeader
        :title="list?.name ?? ''"
        backTo="/lists"
        :backLabel="$t('listDetail.backToLists')"
      >
        <template #actions>
          <UiBadge
            v-if="list"
            :variant="list.public ? 'success' : 'neutral'"
            :icon="list.public ? 'globe' : 'lock'"
          >
            {{ list.public ? $t('lists.public') : $t('lists.private') }}
          </UiBadge>
          <UiButton variant="outline" icon="edit" @click="tab = 'settings'">
            {{ $t('common.edit') }}
          </UiButton>
          <UiButton icon="plus" @click="addElement">{{ $t('elements.add') }}</UiButton>
        </template>
      </AppPageHeader>

      <UiTabs v-model="tab" :tabs="tabs" />

      <!-- Elementos -->
      <section v-if="tab === 'elements'" class="mt-6 space-y-4">
        <UiAlert variant="info">{{ $t('elements.trainingHint') }}</UiAlert>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <UiInput
            v-model="elementFilter"
            icon="search"
            :placeholder="$t('elements.searchPlaceholder')"
            class="w-full sm:max-w-xs"
          />
          <div class="flex shrink-0 items-center gap-2">
            <ElementsImportFilePicker :loading="importing" @parsed="importElements" />
            <UiButton icon="plus" @click="addElement">
              {{ $t('elements.add') }}
            </UiButton>
          </div>
        </div>

        <div v-if="elementsPending" class="space-y-3">
          <UiSkeleton v-for="i in 3" :key="i" class="h-20 w-full rounded-2xl" />
        </div>

        <UiEmptyState
          v-else-if="!elements.length"
          icon="box"
          :title="$t('elements.emptyTitle')"
          :description="$t('elements.emptyDesc')"
        >
          <UiButton icon="plus" @click="addElement">{{ $t('elements.emptyCta') }}</UiButton>
          <ElementsImportFilePicker :loading="importing" @parsed="importElements" />
        </UiEmptyState>

        <UiEmptyState
          v-else-if="!filteredElements.length"
          icon="search"
          :title="$t('elements.noMatches')"
          compact
        />

        <div v-else class="space-y-3">
          <ElementsRow
            v-for="el in pagedElements"
            :key="el.id"
            :element="el"
            @edit="editElement(el)"
            @delete="askDeleteElement(el)"
          />
          <UiPagination
            v-model="elementsPage"
            :total="filteredElements.length"
            :page-size="ELEMENTS_PAGE_SIZE"
            class="pt-2"
          />
        </div>
      </section>

      <!-- Entrenamientos -->
      <section v-else-if="tab === 'trainings'" class="mt-6 space-y-4">
        <div class="flex items-center justify-between gap-3">
          <p class="text-sm text-muted">{{ $t('trainings.subtitle') }}</p>
          <UiButton
            variant="outline"
            icon="refresh"
            class="shrink-0"
            :loading="trainingsPending"
            @click="refreshTrainings"
          >
            {{ $t('trainings.refresh') }}
          </UiButton>
        </div>

        <TrainingsLaunchCard
          v-model:regenerate="regenerateDescriptions"
          :pending="!!pendingTraining"
          :models="embeddingModels.models"
          :default-model="embeddingModels.defaultModel"
          :launching="launching"
          :estimate="costEstimate"
          @launch="launchTraining"
        />

        <div v-if="trainingsPending && !trainings.length" class="space-y-3">
          <UiSkeleton v-for="i in 2" :key="i" class="h-28 w-full rounded-2xl" />
        </div>

        <UiEmptyState
          v-else-if="!historyTrainings.length"
          icon="sparkles"
          :title="$t('trainings.emptyTitle')"
          :description="$t('trainings.emptyDesc')"
        />

        <div v-else class="space-y-3">
          <TrainingsRow
            v-for="tr in historyTrainings"
            :key="tr.id"
            :training="tr"
            :switching="switchingTrainingId === tr.id"
            @use="useTraining(tr.id)"
          />
        </div>
      </section>

      <!-- Ajustes -->
      <section v-else-if="tab === 'settings'" class="mt-6 space-y-6">
        <UiCard>
          <h2 class="text-base font-semibold text-fg">{{ $t('listDetail.settingsTitle') }}</h2>
          <form class="mt-4 space-y-4" @submit.prevent="saveSettings">
            <UiInput
              v-model="settingsForm.name"
              :label="$t('lists.fieldName')"
              :placeholder="$t('lists.fieldNamePlaceholder')"
              required
            />
            <UiTextarea
              v-model="settingsForm.description"
              :label="$t('lists.fieldDescription')"
              :placeholder="$t('lists.fieldDescriptionPlaceholder')"
            />
            <UiSwitch
              v-model="settingsForm.public"
              :label="$t('lists.fieldPublic')"
              :description="$t('lists.fieldPublicHint')"
            />
            <div class="flex justify-end">
              <UiButton
                type="submit"
                :loading="savingSettings"
                :disabled="!settingsForm.name.trim()"
              >
                {{ $t('common.save') }}
              </UiButton>
            </div>
          </form>
        </UiCard>

        <UiCard class="border-danger/40!">
          <h2 class="text-base font-semibold text-danger">{{ $t('listDetail.dangerZone') }}</h2>
          <p class="mt-1 text-sm text-muted">{{ $t('listDetail.dangerDesc') }}</p>
          <div class="mt-4">
            <UiButton variant="danger" icon="trash" @click="deleteListOpen = true">
              {{ $t('lists.deleteTitle') }}
            </UiButton>
          </div>
        </UiCard>
      </section>
    </template>

    <!-- Crear / editar elemento -->
    <ElementsFormModal
      v-model="elModalOpen"
      :list-id="id"
      :element="editingEl"
      @saved="refreshElements"
    />

    <!-- Borrar elemento -->
    <UiConfirmDialog
      v-model="deleteElOpen"
      :title="$t('elements.deleteTitle')"
      :message="$t('elements.deleteDesc', { name: deletingEl?.text ?? '' })"
      :confirm-label="$t('common.delete')"
      :loading="deletingElBusy"
      @confirm="confirmDeleteElement"
    />

    <!-- Borrar lista -->
    <UiConfirmDialog
      v-model="deleteListOpen"
      :title="$t('lists.deleteTitle')"
      :message="$t('lists.deleteDesc', { name: list?.name ?? '' })"
      :confirm-label="$t('common.delete')"
      :loading="deletingList"
      @confirm="confirmDeleteList"
    />
  </div>
</template>
