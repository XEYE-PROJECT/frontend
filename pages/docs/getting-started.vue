<script setup lang="ts">
const { t } = useI18n()

useHead({ title: () => `${t('docs.nav.gettingStarted')} · ${t('docs.title')} · XEYE` })

const sections = computed(() => [
  {
    icon: 'user',
    title: t('docs.start.s1Title'),
    steps: [t('docs.start.s1Step1'), t('docs.start.s1Step2')],
  },
  {
    icon: 'list',
    title: t('docs.start.s2Title'),
    steps: [t('docs.start.s2Step1'), t('docs.start.s2Step2'), t('docs.start.s2Step3')],
  },
  {
    icon: 'database',
    title: t('docs.start.s3Title'),
    steps: [t('docs.start.s3Step1'), t('docs.start.s3Step2'), t('docs.start.s3Step3')],
    tip: t('docs.start.s3Tip'),
  },
  {
    icon: 'zap',
    title: t('docs.start.s4Title'),
    steps: [t('docs.start.s4Step1'), t('docs.start.s4Step2'), t('docs.start.s4Step3')],
    tip: t('docs.start.s4Tip'),
  },
  {
    icon: 'key',
    title: t('docs.start.s5Title'),
    steps: [t('docs.start.s5Step1'), t('docs.start.s5Step2'), t('docs.start.s5Step3')],
  },
  {
    icon: 'search',
    title: t('docs.start.s6Title'),
    steps: [t('docs.start.s6Step1'), t('docs.start.s6Step2'), t('docs.start.s6Step3')],
  },
])
</script>

<template>
  <div class="space-y-6">
    <p class="text-sm text-muted">{{ $t('docs.start.intro') }}</p>

    <DocsSection
      v-for="(section, i) in sections"
      :key="section.title"
      :step="i + 1"
      v-bind="section"
    />

    <UiCard>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0">
          <h2 class="text-sm font-semibold text-fg">{{ $t('docs.start.doneTitle') }}</h2>
          <p class="mt-1 text-sm text-muted">{{ $t('docs.start.doneDesc') }}</p>
        </div>
        <UiButton to="/docs/api" variant="secondary" icon="arrow-right" class="shrink-0">
          {{ $t('docs.start.doneCta') }}
        </UiButton>
      </div>
    </UiCard>

    <DocsNextLink to="/docs/lists" :label="$t('docs.nav.lists')" />
  </div>
</template>
