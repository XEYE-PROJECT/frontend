<script setup lang="ts">
import type { Training } from '~/types/api'

const props = defineProps<{ training: Training; switching?: boolean }>()

const emit = defineEmits<{ use: [] }>()

const { locale } = useI18n()

// Elegible para "usar": lo calcula el backend (completado y con los mismos elementos que la lista).
const canUse = computed(() => !props.training.inUse && props.training.usable === true)
const notUsable = computed(
  () =>
    !props.training.inUse && props.training.status === 'completed' && props.training.usable === false,
)

// El LLM puede fallar en algún elemento (se entrena con su texto en crudo): avisar si pasó.
const partialDescriptions = computed(
  () =>
    props.training.describedCount != null &&
    props.training.elementCount != null &&
    props.training.describedCount < props.training.elementCount,
)
</script>

<template>
  <UiCard>
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex flex-wrap items-center gap-2">
          <TrainingsStatusBadge :status="training.status" />
          <UiBadge v-if="training.inUse" variant="primary" dot>{{ $t('trainings.inUse') }}</UiBadge>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-xs text-subtle">
            {{ $t('trainings.started', { date: formatRelative(training.createdAt, locale) }) }}
          </span>
          <UiButton
            v-if="canUse"
            variant="subtle"
            size="sm"
            icon="check"
            :loading="switching"
            @click="emit('use')"
          >
            {{ $t('trainings.use') }}
          </UiButton>
          <span v-else-if="notUsable" class="text-xs text-subtle" :title="$t('trainings.notUsableHint')">
            {{ $t('trainings.notUsable') }}
          </span>
        </div>
      </div>

      <dl class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div class="min-w-0">
          <dt class="text-xs text-subtle">{{ $t('trainings.model') }}</dt>
          <dd class="mt-0.5 truncate text-sm font-medium text-fg">
            {{ embeddingModelName(training.model) }}
          </dd>
        </div>
        <div class="min-w-0">
          <dt class="text-xs text-subtle">{{ $t('trainings.elements') }}</dt>
          <dd class="mt-0.5 text-sm font-medium text-fg">
            {{ training.elementCount ?? '—' }}
            <span
              v-if="training.describedCount != null"
              class="font-normal"
              :class="partialDescriptions ? 'text-warning' : 'text-subtle'"
              :title="partialDescriptions ? $t('trainings.describedHint') : undefined"
            >
              · {{ $t('trainings.describedCount', { n: training.describedCount }) }}
            </span>
          </dd>
        </div>
        <div class="min-w-0">
          <dt class="text-xs text-subtle">{{ $t('trainings.duration') }}</dt>
          <dd class="mt-0.5 text-sm font-medium text-fg">
            {{
              training.time?.totalSeconds != null
                ? $t('trainings.seconds', { n: training.time.totalSeconds })
                : '—'
            }}
          </dd>
        </div>
        <div class="min-w-0">
          <dt class="text-xs text-subtle">{{ $t('trainings.cost') }}</dt>
          <dd class="mt-0.5 text-sm font-medium text-fg">
            {{ formatCost(training.cost?.total, locale) }}
          </dd>
        </div>
      </dl>

      <UiAlert
        v-if="training.status === 'failed' && training.error"
        variant="danger"
        :title="$t('trainings.errorLabel')"
      >
        {{ training.error }}
      </UiAlert>
    </div>
  </UiCard>
</template>
