<script setup lang="ts">
import type { Element } from '~/types/api'

const props = defineProps<{ listId: number; element?: Element }>()
const emit = defineEmits<{ saved: [] }>()
const open = defineModel<boolean>({ default: false })

const { t } = useI18n()
const toast = useToast()
const elementsApi = useElementsApi()

const form = reactive({ text: '', params: '', description: '' })
const saving = ref(false)

const paramsInvalid = computed(
  () => form.params.trim().length > 0 && !isValidJson(form.params),
)

function reset() {
  form.text = props.element?.text ?? ''
  form.params = props.element?.params ?? ''
  form.description = props.element?.description ?? ''
}

watch(
  () => [open.value, props.element] as const,
  ([isOpen]) => {
    if (isOpen) reset()
  },
  { immediate: true },
)

async function save() {
  if (!form.text.trim()) return
  saving.value = true
  try {
    const body = {
      text: form.text.trim(),
      params: form.params.trim() ? form.params : null,
      description: form.description.trim() ? form.description.trim() : null,
    }
    if (props.element) {
      await elementsApi.update(props.element.id, body)
      toast.success(t('elements.updated'))
    } else {
      await elementsApi.create(props.listId, body)
      toast.success(t('elements.created'))
    }
    emit('saved')
    open.value = false
  } catch (e) {
    toast.error(apiErrorMessage(e, t))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UiModal
    v-model="open"
    :title="element ? $t('elements.editTitle') : $t('elements.createTitle')"
  >
    <form class="space-y-4" @submit.prevent="save">
      <UiInput
        v-model="form.text"
        :label="$t('elements.fieldText')"
        :placeholder="$t('elements.fieldTextPlaceholder')"
        required
      />
      <UiTextarea
        v-model="form.params"
        mono
        :rows="4"
        :label="$t('elements.fieldParams')"
        :hint="$t('elements.fieldParamsHint')"
        :error="paramsInvalid ? $t('elements.fieldParamsInvalid') : undefined"
      />
      <UiTextarea
        v-model="form.description"
        :label="$t('elements.fieldDescription')"
        :placeholder="$t('elements.fieldDescriptionPlaceholder')"
      />
    </form>

    <template #footer>
      <UiButton variant="ghost" :disabled="saving" @click="open = false">
        {{ $t('common.cancel') }}
      </UiButton>
      <UiButton :loading="saving" :disabled="!form.text.trim()" @click="save">
        {{ element ? $t('common.save') : $t('common.create') }}
      </UiButton>
    </template>
  </UiModal>
</template>
