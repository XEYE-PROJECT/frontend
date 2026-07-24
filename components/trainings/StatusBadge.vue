<script setup lang="ts">
import type { TrainingStatus } from '~/types/api'

type Variant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

const props = defineProps<{ status: TrainingStatus }>()

const map: Record<TrainingStatus, { variant: Variant; icon: string; key: string }> = {
  pending: { variant: 'warning', icon: 'clock', key: 'trainings.statusPending' },
  queued: { variant: 'neutral', icon: 'clock', key: 'trainings.statusQueued' },
  initialized: { variant: 'info', icon: 'loader', key: 'trainings.statusInitialized' },
  optimizing: { variant: 'warning', icon: 'loader', key: 'trainings.statusOptimizing' },
  training: { variant: 'warning', icon: 'loader', key: 'trainings.statusTraining' },
  completed: { variant: 'success', icon: 'check-circle', key: 'trainings.statusCompleted' },
  failed: { variant: 'danger', icon: 'alert-triangle', key: 'trainings.statusFailed' },
}

const meta = computed(() => map[props.status])
</script>

<template>
  <UiBadge :variant="meta.variant" :icon="meta.icon">{{ $t(meta.key) }}</UiBadge>
</template>
