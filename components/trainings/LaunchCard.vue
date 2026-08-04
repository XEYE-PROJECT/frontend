<script setup lang="ts">
import type { TrainingCostEstimate } from '~/types/api'

// Caja de lanzamiento siempre visible: variante de aviso si una edición dejó un
// entrenamiento pendiente, neutra si la lista está al día pero se quiere
// reentrenar igualmente (p. ej. con otro modelo de embeddings).
const props = defineProps<{
  pending: boolean
  models: string[]
  defaultModel: string | null
  launching?: boolean
  estimate?: TrainingCostEstimate | null
}>()

const { locale } = useI18n()

const emit = defineEmits<{ launch: [model: string | null] }>()

// Regenerar todas las descripciones IA (ignorando la caché). Vive en el padre
// (v-model) porque cambiarlo re-pide la estimación de precio al backend.
const regenerate = defineModel<boolean>('regenerate', { default: false })

const model = ref<string | null>(props.defaultModel)
watch(
  () => props.defaultModel,
  (value) => {
    if (model.value == null) model.value = value
  },
)

const options = computed(() => props.models.map((m) => ({ value: m, label: m })))
</script>

<template>
  <UiCard :class="pending ? 'border-warning/40!' : undefined">
    <div class="flex flex-col gap-4">
      <div class="flex items-start gap-3">
        <span
          class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          :class="pending ? 'bg-warning-soft text-warning' : 'bg-primary-soft text-primary'"
        >
          <UiIcon :name="pending ? 'alert-triangle' : 'sparkles'" :size="18" />
        </span>
        <div class="min-w-0">
          <h3 class="text-sm font-semibold text-fg">
            {{ pending ? $t('trainings.pendingTitle') : $t('trainings.retrainTitle') }}
          </h3>
          <p class="mt-0.5 text-sm text-muted">
            {{ pending ? $t('trainings.pendingDesc') : $t('trainings.retrainDesc') }}
          </p>
          <p v-if="estimate" class="mt-1.5 text-sm text-fg">
            {{ $t('trainings.estimatedPrice', { price: formatCost(estimate.total, locale) }) }}
            <span class="text-subtle">
              · {{ $t('trainings.estimatedDescriptions', { n: estimate.descriptionsToGenerate }) }}
            </span>
          </p>
        </div>
      </div>

      <UiSwitch
        v-model="regenerate"
        :label="$t('trainings.regenerateLabel')"
        :description="$t('trainings.regenerateHint')"
      />

      <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
        <UiSelect
          v-model="model"
          :label="$t('trainings.modelLabel')"
          :options="options"
          class="w-full sm:max-w-md"
        />
        <UiButton
          icon="sparkles"
          class="shrink-0"
          :loading="launching"
          @click="emit('launch', model)"
        >
          {{ pending ? $t('trainings.train') : $t('trainings.retrain') }}
        </UiButton>
      </div>
    </div>
  </UiCard>
</template>
