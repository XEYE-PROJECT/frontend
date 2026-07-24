<script setup lang="ts">
const open = defineModel<boolean>({ default: false })
const emit = defineEmits<{ created: [] }>()

const { t } = useI18n()
const toast = useToast()
const keysApi = useApiKeysApi()

const step = ref<1 | 2>(1)
const name = ref('')
const creating = ref(false)
const createdKey = ref('')

async function create() {
  creating.value = true
  try {
    const key = await keysApi.create(name.value.trim() || undefined)
    createdKey.value = key.apiKey
    toast.success(t('apiKeys.created'))
    emit('created')
    step.value = 2
  } catch (e) {
    toast.error(apiErrorMessage(e, t))
  } finally {
    creating.value = false
  }
}

// Vuelve al paso 1 al abrir el modal (así la transición de salida sigue
// mostrando la clave creada sin un parpadeo de vuelta al paso 1).
watch(open, (isOpen) => {
  if (isOpen) {
    step.value = 1
    name.value = ''
    createdKey.value = ''
  }
})
</script>

<template>
  <UiModal
    v-model="open"
    :title="step === 1 ? $t('apiKeys.createTitle') : $t('apiKeys.createdTitle')"
  >
    <div v-if="step === 1" class="space-y-4">
      <UiInput
        v-model="name"
        :label="$t('apiKeys.fieldName')"
        :placeholder="$t('apiKeys.fieldNamePlaceholder')"
        @keyup.enter="create"
      />
    </div>

    <div v-else class="space-y-4">
      <UiAlert variant="warning">{{ $t('apiKeys.createdWarning') }}</UiAlert>
      <div class="flex items-center gap-2">
        <div class="min-w-0 flex-1 rounded-lg bg-surface-2 px-3 py-2.5">
          <code class="font-mono text-sm break-all text-fg">{{ createdKey }}</code>
        </div>
        <UiCopyButton :text="createdKey" size="sm" variant="secondary" />
      </div>
    </div>

    <template #footer>
      <template v-if="step === 1">
        <UiButton variant="ghost" @click="open = false">{{ $t('common.cancel') }}</UiButton>
        <UiButton icon="plus" :loading="creating" @click="create">
          {{ creating ? $t('common.creating') : $t('common.create') }}
        </UiButton>
      </template>
      <UiButton v-else @click="open = false">{{ $t('common.close') }}</UiButton>
    </template>
  </UiModal>
</template>
