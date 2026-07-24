<script setup lang="ts">
import type { ImportElementItem, ItemList } from '~/types/api'

const props = defineProps<{ list?: ItemList }>()
const emit = defineEmits<{ saved: [list: ItemList] }>()
const open = defineModel<boolean>({ default: false })

const { t } = useI18n()
const listsApi = useListsApi()
const elementsApi = useElementsApi()
const toast = useToast()

const form = reactive({ name: '', description: '', public: false })
const saving = ref(false)

// Elementos elegidos de un JSON (solo en modo crear); se importan justo tras crear la lista.
const importItems = shallowRef<ImportElementItem[] | null>(null)
const importFileName = shallowRef('')

watch(
  () => [open.value, props.list] as const,
  ([isOpen]) => {
    if (!isOpen) return
    form.name = props.list?.name ?? ''
    form.description = props.list?.description ?? ''
    form.public = props.list?.public ?? false
    clearImport()
  },
  { immediate: true },
)

function onImportParsed(items: ImportElementItem[], fileName: string) {
  importItems.value = items
  importFileName.value = fileName
}

function clearImport() {
  importItems.value = null
  importFileName.value = ''
}

async function save() {
  if (!form.name.trim() || saving.value) return
  saving.value = true
  try {
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() ? form.description.trim() : null,
      public: form.public,
    }
    const result = props.list
      ? await listsApi.update(props.list.id, payload)
      : await listsApi.create(payload)
    toast.success(props.list ? t('lists.updated') : t('lists.created'))
    if (!props.list && importItems.value) {
      try {
        await elementsApi.importElements(result.id, { elements: importItems.value })
        toast.success(t('elements.imported', { count: importItems.value.length }))
      } catch (e) {
        // La lista ya existe llegados aquí: muestra el error y deja reintentar desde el detalle.
        toast.error(apiErrorMessage(e, t))
      }
    }
    emit('saved', result)
    open.value = false
  } catch (e) {
    toast.error(apiErrorMessage(e, t))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UiModal v-model="open" :title="list ? $t('lists.editTitle') : $t('lists.createTitle')">
    <form class="space-y-4" @submit.prevent="save">
      <UiInput
        v-model="form.name"
        :label="$t('lists.fieldName')"
        :placeholder="$t('lists.fieldNamePlaceholder')"
        required
      />
      <UiTextarea
        v-model="form.description"
        :label="$t('lists.fieldDescription')"
        :placeholder="$t('lists.fieldDescriptionPlaceholder')"
        :rows="4"
      />
      <UiSwitch
        v-model="form.public"
        :label="$t('lists.fieldPublic')"
        :description="$t('lists.fieldPublicHint')"
      />

      <div v-if="!list" class="space-y-2">
        <p class="text-sm font-medium text-fg">{{ $t('elements.importLabel') }}</p>
        <div
          v-if="importItems"
          class="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2"
        >
          <p class="truncate text-sm text-fg">
            {{ $t('elements.importReady', { count: importItems.length, file: importFileName }) }}
          </p>
          <UiButton
            variant="ghost"
            size="icon-sm"
            icon="x"
            :aria-label="$t('common.cancel')"
            @click="clearImport"
          />
        </div>
        <ElementsImportFilePicker v-else :disabled="saving" @parsed="onImportParsed" />
        <p class="text-xs text-muted">{{ $t('elements.importHint') }}</p>
      </div>
    </form>

    <template #footer>
      <UiButton variant="ghost" :disabled="saving" @click="open = false">
        {{ $t('common.cancel') }}
      </UiButton>
      <UiButton :loading="saving" :disabled="!form.name.trim()" @click="save">
        {{ $t('common.save') }}
      </UiButton>
    </template>
  </UiModal>
</template>
