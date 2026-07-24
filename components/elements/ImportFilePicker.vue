<script setup lang="ts">
import type { ImportElementItem } from '~/types/api'

// Selector sin estado: abre un diálogo de fichero JSON, lo parsea y entrega los
// elementos al padre (que decide si importa ya o después). Los errores de parseo se toastean aquí.
defineOptions({ inheritAttrs: false })

withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'subtle'
    disabled?: boolean
    loading?: boolean
  }>(),
  { variant: 'outline' },
)
const emit = defineEmits<{ parsed: [items: ImportElementItem[], fileName: string] }>()

const { t } = useI18n()
const toast = useToast()
const input = useTemplateRef<HTMLInputElement>('input')

async function onChange(event: Event) {
  const el = event.target as HTMLInputElement
  const file = el.files?.[0]
  el.value = ''
  if (!file) return
  try {
    emit('parsed', parseElementsImport(await file.text()), file.name)
  } catch (e) {
    toast.error(
      e instanceof ElementImportError
        ? t(e.message, { index: e.index ?? 0 })
        : t('elements.importErrorInvalidJson'),
    )
  }
}
</script>

<template>
  <UiButton
    v-bind="$attrs"
    :variant="variant"
    icon="upload"
    :disabled="disabled"
    :loading="loading"
    @click="input?.click()"
  >
    <slot>{{ $t('elements.importCta') }}</slot>
  </UiButton>
  <input
    ref="input"
    type="file"
    accept=".json,application/json"
    class="hidden"
    @change="onChange"
  />
</template>
