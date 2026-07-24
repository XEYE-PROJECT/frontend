<script setup lang="ts">
import type { Training } from '~/types/api'

defineProps<{ training: Training }>()

const { locale } = useI18n()
</script>

<template>
  <UiCard>
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex flex-wrap items-center gap-2">
          <TrainingsStatusBadge :status="training.status" />
          <UiBadge v-if="training.inUse" variant="primary" dot>{{ $t('trainings.inUse') }}</UiBadge>
        </div>
        <span class="text-xs text-subtle">
          {{ $t('trainings.started', { date: formatRelative(training.createdAt, locale) }) }}
        </span>
      </div>

      <dl class="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
