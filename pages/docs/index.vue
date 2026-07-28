<script setup lang="ts">
const { t } = useI18n()

useHead({ title: () => `${t('docs.nav.intro')} · ${t('docs.title')} · XEYE` })

const concepts = computed(() => [
  { icon: 'list', name: t('docs.intro.conceptList'), desc: t('docs.intro.conceptListDesc') },
  {
    icon: 'database',
    name: t('docs.intro.conceptElement'),
    desc: t('docs.intro.conceptElementDesc'),
  },
  {
    icon: 'zap',
    name: t('docs.intro.conceptTraining'),
    desc: t('docs.intro.conceptTrainingDesc'),
  },
  { icon: 'key', name: t('docs.intro.conceptKey'), desc: t('docs.intro.conceptKeyDesc') },
])

const flow = computed(() => [
  t('docs.intro.flow1'),
  t('docs.intro.flow2'),
  t('docs.intro.flow3'),
  t('docs.intro.flow4'),
  t('docs.intro.flow5'),
])

const ways = computed(() => [
  {
    icon: 'grid',
    name: t('docs.intro.wayConsoleTitle'),
    desc: t('docs.intro.wayConsoleDesc'),
  },
  { icon: 'globe', name: t('docs.intro.wayApiTitle'), desc: t('docs.intro.wayApiDesc') },
])
</script>

<template>
  <div class="space-y-6">
    <DocsBlock :title="$t('docs.intro.whatTitle')" icon="eye">
      <p>{{ $t('docs.intro.whatP1') }}</p>
      <p>{{ $t('docs.intro.whatP2') }}</p>
      <div class="flex flex-wrap items-center gap-2 pt-1">
        <template v-for="(item, i) in flow" :key="item">
          <UiIcon v-if="i > 0" name="chevron-right" :size="14" class="text-subtle" />
          <span class="rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-fg">
            {{ item }}
          </span>
        </template>
      </div>
    </DocsBlock>

    <DocsBlock :title="$t('docs.intro.conceptsTitle')" icon="layers">
      <div class="grid gap-3 sm:grid-cols-2">
        <div
          v-for="concept in concepts"
          :key="concept.name"
          class="rounded-xl border border-line p-4"
        >
          <div class="mb-2 flex items-center gap-2">
            <UiIcon :name="concept.icon" :size="16" class="text-primary" />
            <h3 class="text-sm font-medium text-fg">{{ concept.name }}</h3>
          </div>
          <p class="text-sm text-muted">{{ concept.desc }}</p>
        </div>
      </div>
    </DocsBlock>

    <DocsBlock :title="$t('docs.intro.waysTitle')" icon="grid">
      <div class="grid gap-3 sm:grid-cols-2">
        <div v-for="way in ways" :key="way.name" class="rounded-xl border border-line p-4">
          <div class="mb-2 flex items-center gap-2">
            <UiIcon :name="way.icon" :size="16" class="text-primary" />
            <h3 class="text-sm font-medium text-fg">{{ way.name }}</h3>
          </div>
          <p class="text-sm text-muted">{{ way.desc }}</p>
        </div>
      </div>
    </DocsBlock>

    <DocsNextLink to="/docs/getting-started" :label="$t('docs.nav.gettingStarted')" />
  </div>
</template>
