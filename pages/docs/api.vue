<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()

useHead({ title: () => `${t('docs.nav.api')} · ${t('docs.title')} · XEYE` })

// Los ejemplos apuntan al servicio de búsqueda real de este despliegue.
const searchUrl = config.public.searchUrl as string

const bodyParams = computed(() => [
  { name: 'list_name', desc: t('docs.api.pListNameDesc') },
  { name: 'search_term', desc: t('docs.api.pSearchTermDesc') },
  { name: 'limit', desc: t('docs.api.pLimitDesc') },
])

const errors = computed(() => [
  { code: '401', meaning: t('docs.api.err401'), fix: t('docs.api.err401Fix') },
  { code: '403', meaning: t('docs.api.err403'), fix: t('docs.api.err403Fix') },
  { code: '404', meaning: t('docs.api.err404'), fix: t('docs.api.err404Fix') },
  { code: '429', meaning: t('docs.api.err429'), fix: t('docs.api.err429Fix') },
])

const recommendations = computed(() => [
  t('docs.api.rec1'),
  t('docs.api.rec2'),
  t('docs.api.rec3'),
])

const curlExample = `curl -X POST ${searchUrl}/api/v1/search \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "list_name": "products",
    "search_term": "wireless headphones",
    "limit": 5
  }'`

const jsExample = `const response = await fetch('${searchUrl}/api/v1/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.XEYE_API_KEY,
  },
  body: JSON.stringify({
    list_name: 'products',
    search_term: 'wireless headphones',
    limit: 5,
  }),
})

const { results } = await response.json()`

const responseExample = `{
  "success": true,
  "results": [
    {
      "item": "Sony WH-1000XM5 wireless headphones",
      "score": 0.93,
      "params": {
        "sku": "SONY-XM5",
        "url": "/products/sony-wh-1000xm5",
        "price": 348
      }
    }
  ],
  "total_results": 1,
  "search_term": "wireless headphones",
  "list_name": "products",
  "duration_ms": 42
}`
</script>

<template>
  <div class="space-y-6">
    <DocsBlock :title="$t('docs.api.keysTitle')" icon="key">
      <p>{{ $t('docs.api.keysP1') }}</p>
      <UiAlert variant="warning">{{ $t('docs.api.keysWarning') }}</UiAlert>
    </DocsBlock>

    <DocsBlock :title="$t('docs.api.endpointTitle')" icon="globe">
      <p>{{ $t('docs.api.endpointP1') }}</p>
      <DocsCodeBlock :code="curlExample" label="cURL" />
      <div>
        <h3 class="mb-3 text-sm font-medium text-fg">{{ $t('docs.api.paramsTitle') }}</h3>
        <ul class="space-y-3">
          <li v-for="param in bodyParams" :key="param.name" class="flex items-start gap-3">
            <code
              class="mt-0.5 shrink-0 rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-fg"
            >
              {{ param.name }}
            </code>
            <p>{{ param.desc }}</p>
          </li>
        </ul>
      </div>
      <DocsCodeBlock :code="jsExample" label="JavaScript" />
    </DocsBlock>

    <DocsBlock :title="$t('docs.api.responseTitle')" icon="arrow-left">
      <p>{{ $t('docs.api.responseP1') }}</p>
      <DocsCodeBlock :code="responseExample" label="200 OK" />
    </DocsBlock>

    <DocsBlock :title="$t('docs.api.errorsTitle')" icon="alert-triangle">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-line text-xs text-subtle">
              <th class="py-2 pr-4 font-medium">{{ $t('docs.api.errCode') }}</th>
              <th class="py-2 pr-4 font-medium">{{ $t('docs.api.errMeaning') }}</th>
              <th class="py-2 font-medium">{{ $t('docs.api.errFix') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="error in errors" :key="error.code" class="border-b border-line last:border-0">
              <td class="py-3 pr-4 align-top">
                <UiBadge variant="danger">{{ error.code }}</UiBadge>
              </td>
              <td class="py-3 pr-4 align-top text-muted">{{ error.meaning }}</td>
              <td class="py-3 align-top text-muted">{{ error.fix }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DocsBlock>

    <DocsTips :items="recommendations" />

    <DocsNextLink to="/docs/best-practices" :label="$t('docs.nav.bestPractices')" />
  </div>
</template>
