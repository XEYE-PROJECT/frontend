<script setup lang="ts">
const { t } = useI18n()

useHead({ title: () => `${t('docs.nav.trainings')} · ${t('docs.title')} · XEYE` })

// Reutiliza las etiquetas de estado reales de la pestaña Entrenamientos.
const lifecycle = computed(() => [
  {
    label: t('trainings.statusPending'),
    variant: 'warning' as const,
    desc: t('docs.trainings.stPendingDesc'),
  },
  {
    label: t('trainings.statusQueued'),
    variant: 'info' as const,
    desc: t('docs.trainings.stQueuedDesc'),
  },
  {
    label: t('trainings.statusTraining'),
    variant: 'primary' as const,
    desc: t('docs.trainings.stTrainingDesc'),
  },
  {
    label: t('trainings.statusCompleted'),
    variant: 'success' as const,
    desc: t('docs.trainings.stCompletedDesc'),
  },
  {
    label: t('trainings.statusFailed'),
    variant: 'danger' as const,
    desc: t('docs.trainings.stFailedDesc'),
  },
])

const limits = computed(() => [t('docs.trainings.limit1'), t('docs.trainings.limit2')])

const recommendations = computed(() => [
  t('docs.trainings.rec1'),
  t('docs.trainings.rec2'),
  t('docs.trainings.rec3'),
  t('docs.trainings.rec4'),
])
</script>

<template>
  <div class="space-y-6">
    <DocsBlock :title="$t('docs.trainings.lifecycleTitle')" icon="zap">
      <p>{{ $t('docs.trainings.p1') }}</p>
      <p>{{ $t('docs.trainings.lifecycleP1') }}</p>
      <ul class="space-y-3">
        <li v-for="status in lifecycle" :key="status.label" class="flex items-start gap-3">
          <UiBadge :variant="status.variant" dot class="mt-0.5 w-24 shrink-0 justify-center">
            {{ status.label }}
          </UiBadge>
          <p>{{ status.desc }}</p>
        </li>
      </ul>
    </DocsBlock>

    <DocsBlock :title="$t('docs.trainings.modelsTitle')" icon="layers">
      <p>{{ $t('docs.trainings.modelsP1') }}</p>
      <p>{{ $t('docs.trainings.modelsP2') }}</p>
    </DocsBlock>

    <DocsBlock :title="$t('docs.trainings.inUseTitle')" icon="check-circle">
      <p>{{ $t('docs.trainings.inUseP1') }}</p>
      <p>{{ $t('docs.trainings.inUseP2') }}</p>
    </DocsBlock>

    <DocsBlock :title="$t('docs.trainings.limitsTitle')" icon="clock">
      <ul class="space-y-3">
        <li v-for="limit in limits" :key="limit" class="flex items-start gap-3">
          <UiIcon name="chevron-right" :size="14" class="mt-1 shrink-0 text-subtle" />
          <p>{{ limit }}</p>
        </li>
      </ul>
    </DocsBlock>

    <DocsTips :items="recommendations" />

    <DocsNextLink to="/docs/api" :label="$t('docs.nav.api')" />
  </div>
</template>
