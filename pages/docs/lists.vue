<script setup lang="ts">
const { t } = useI18n()

useHead({ title: () => `${t('docs.nav.lists')} · ${t('docs.title')} · XEYE` })

const listFields = computed(() => [
  { name: t('docs.lists.fName'), desc: t('docs.lists.fNameDesc') },
  { name: t('docs.lists.fDescription'), desc: t('docs.lists.fDescriptionDesc') },
  { name: t('docs.lists.fVisibility'), desc: t('docs.lists.fVisibilityDesc') },
])

const elementFields = computed(() => [
  { name: t('docs.lists.fText'), desc: t('docs.lists.fTextDesc') },
  { name: t('docs.lists.fDesc2'), desc: t('docs.lists.fDesc2Desc') },
  { name: t('docs.lists.fParams'), desc: t('docs.lists.fParamsDesc') },
])

const recommendations = computed(() => [
  t('docs.lists.rec1'),
  t('docs.lists.rec2'),
  t('docs.lists.rec3'),
  t('docs.lists.rec4'),
])

const elementExample = `{
  "text": "Sony WH-1000XM5 wireless headphones",
  "description": "Noise-cancelling over-ear headphones, 30h battery, Bluetooth 5.2",
  "params": {
    "sku": "SONY-XM5",
    "url": "/products/sony-wh-1000xm5",
    "price": 348
  }
}`

const importExample = `[
  {
    "text": "Sony WH-1000XM5 wireless headphones",
    "description": "Noise-cancelling over-ear headphones",
    "params": { "sku": "SONY-XM5" }
  },
  {
    "text": "Logitech MX Master 3S mouse",
    "params": { "sku": "LOGI-MX3S" }
  },
  { "text": "USB-C 100W charging cable" }
]`
</script>

<template>
  <div class="space-y-6">
    <DocsBlock :title="$t('docs.lists.listsTitle')" icon="list">
      <p>{{ $t('docs.lists.listsP1') }}</p>
      <ul class="space-y-3">
        <li v-for="field in listFields" :key="field.name" class="flex items-start gap-3">
          <UiIcon name="chevron-right" :size="14" class="mt-1 shrink-0 text-subtle" />
          <p><span class="font-medium text-fg">{{ field.name }}.</span> {{ field.desc }}</p>
        </li>
      </ul>
    </DocsBlock>

    <DocsBlock :title="$t('docs.lists.elementsTitle')" icon="database">
      <p>{{ $t('docs.lists.elementsP1') }}</p>
      <ul class="space-y-3">
        <li v-for="field in elementFields" :key="field.name" class="flex items-start gap-3">
          <UiIcon name="chevron-right" :size="14" class="mt-1 shrink-0 text-subtle" />
          <p><span class="font-medium text-fg">{{ field.name }}.</span> {{ field.desc }}</p>
        </li>
      </ul>
      <DocsCodeBlock :code="elementExample" :label="$t('docs.lists.exampleTitle')" />
      <p>{{ $t('docs.lists.exampleNote') }}</p>
    </DocsBlock>

    <DocsBlock :title="$t('docs.lists.importTitle')" icon="upload">
      <p>{{ $t('docs.lists.importP1') }}</p>
      <DocsCodeBlock :code="importExample" label="elements.json" />
      <UiAlert variant="info">{{ $t('docs.lists.importNote') }}</UiAlert>
    </DocsBlock>

    <DocsTips :items="recommendations" />

    <DocsNextLink to="/docs/trainings" :label="$t('docs.nav.trainings')" />
  </div>
</template>
