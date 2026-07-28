<script setup lang="ts">
const { t } = useI18n()

useHead({ title: () => `${t('docs.nav.bestPractices')} · ${t('docs.title')} · XEYE` })

const groups = computed(() => [
  {
    title: t('docs.best.contentTitle'),
    icon: 'edit',
    items: [t('docs.best.content1'), t('docs.best.content2'), t('docs.best.content3')],
  },
  {
    title: t('docs.best.workflowTitle'),
    icon: 'zap',
    items: [t('docs.best.workflow1'), t('docs.best.workflow2'), t('docs.best.workflow3')],
  },
  {
    title: t('docs.best.securityTitle'),
    icon: 'lock',
    items: [t('docs.best.security1'), t('docs.best.security2'), t('docs.best.security3')],
  },
])

const faq = computed(() => [
  { question: t('docs.best.q1'), answer: t('docs.best.a1') },
  { question: t('docs.best.q2'), answer: t('docs.best.a2') },
  { question: t('docs.best.q3'), answer: t('docs.best.a3') },
  { question: t('docs.best.q4'), answer: t('docs.best.a4') },
  { question: t('docs.best.q5'), answer: t('docs.best.a5') },
  { question: t('docs.best.q6'), answer: t('docs.best.a6') },
])
</script>

<template>
  <div class="space-y-6">
    <DocsTips
      v-for="group in groups"
      :key="group.title"
      :title="group.title"
      :icon="group.icon"
      :items="group.items"
    />

    <DocsBlock :title="$t('docs.best.faqTitle')" icon="info">
      <div class="space-y-3">
        <DocsFaqItem v-for="entry in faq" :key="entry.question" v-bind="entry" />
      </div>
    </DocsBlock>
  </div>
</template>
