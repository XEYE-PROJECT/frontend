<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()

useHead({ title: () => `${t('docs.nav.api')} · ${t('docs.title')} · XEYE` })

// Los ejemplos apuntan al servicio de búsqueda real de este despliegue.
const searchUrl = config.public.searchUrl as string

const bodyParams = computed(() => [
  { name: 'list_name', req: true, desc: t('docs.api.pListNameDesc') },
  { name: 'search_term', req: true, desc: t('docs.api.pSearchTermDesc') },
  { name: 'limit', req: false, desc: t('docs.api.pLimitDesc') },
  { name: 'session', req: false, desc: t('docs.api.pSessionDesc') },
  { name: 'include_score_breakdown', req: false, desc: t('docs.api.pBreakdownDesc') },
  { name: 'register_log', req: false, desc: t('docs.api.pRegisterLogDesc') },
])

const errors = computed(() => [
  {
    status: '400',
    code: 'INVALID_HOST',
    meaning: t('docs.api.err400'),
    fix: t('docs.api.err400Fix'),
  },
  {
    status: '401',
    code: 'API_KEY_MISSING · API_KEY_INVALID',
    meaning: t('docs.api.err401'),
    fix: t('docs.api.err401Fix'),
  },
  {
    status: '403',
    code: 'LIST_NOT_PUBLIC',
    meaning: t('docs.api.err403'),
    fix: t('docs.api.err403Fix'),
  },
  {
    status: '404',
    code: 'LIST_NOT_FOUND',
    meaning: t('docs.api.err404'),
    fix: t('docs.api.err404Fix'),
  },
  {
    status: '413',
    code: 'REQUEST_TOO_LARGE',
    meaning: t('docs.api.err413'),
    fix: t('docs.api.err413Fix'),
  },
  {
    status: '422',
    code: 'VALIDATION_FAILED',
    meaning: t('docs.api.err422'),
    fix: t('docs.api.err422Fix'),
  },
  {
    status: '429',
    code: 'RATE_LIMITED',
    meaning: t('docs.api.err429'),
    fix: t('docs.api.err429Fix'),
  },
  {
    status: '503',
    code: 'SERVICE_NOT_READY · BACKEND_UNAVAILABLE',
    meaning: t('docs.api.err503'),
    fix: t('docs.api.err503Fix'),
  },
])

const recommendations = computed(() => [
  t('docs.api.rec1'),
  t('docs.api.rec2'),
  t('docs.api.rec3'),
  t('docs.api.rec4'),
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
    session: sessionId,          // optional: groups a user's searches
    include_score_breakdown: true,
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
      },
      "text_score": 0.71,
      "semantic_score": 0.96
    }
  ],
  "total_results": 1,
  "search_term": "wireless headphones",
  "list_name": "products",
  "duration_ms": 42,
  "degraded": false,
  "degradation_reasons": []
}`

const targetExample = `curl -X POST ${searchUrl}/api/v1/target \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "list_name": "products",
    "target_term": "Sony WH-1000XM5 wireless headphones",
    "session": "b1f2-…"
  }'`

const errorExample = `HTTP/1.1 429 Too Many Requests
Retry-After: 23
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 23

{
  "status": 429,
  "error": "Too Many Requests",
  "code": "RATE_LIMITED",
  "message": "Rate limit of 60 requests per minute per account exceeded; retry in 23 seconds"
}`
</script>

<template>
  <div class="space-y-6">
    <DocsBlock :title="$t('docs.api.keysTitle')" icon="key">
      <p>{{ $t('docs.api.keysP1') }}</p>
      <p>{{ $t('docs.api.keysP2') }}</p>
      <UiAlert variant="warning">{{ $t('docs.api.keysWarning') }}</UiAlert>
    </DocsBlock>

    <DocsBlock :title="$t('docs.api.endpointTitle')" icon="globe">
      <p>{{ $t('docs.api.endpointP1') }}</p>
      <DocsCodeBlock :code="curlExample" label="cURL" />
      <div>
        <h3 class="mb-3 text-sm font-medium text-fg">{{ $t('docs.api.paramsTitle') }}</h3>
        <p class="mb-3 text-sm text-muted">{{ $t('docs.api.paramsP1') }}</p>
        <ul class="space-y-3">
          <li v-for="param in bodyParams" :key="param.name" class="flex items-start gap-3">
            <code
              class="mt-0.5 shrink-0 rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-fg"
            >
              {{ param.name }}
            </code>
            <p>
              <UiBadge :variant="param.req ? 'primary' : 'neutral'" class="mr-1.5">
                {{ param.req ? $t('docs.api.required') : $t('docs.api.optional') }}
              </UiBadge>
              {{ param.desc }}
            </p>
          </li>
        </ul>
      </div>
      <DocsCodeBlock :code="jsExample" label="JavaScript" />
    </DocsBlock>

    <DocsBlock :title="$t('docs.api.responseTitle')" icon="arrow-left">
      <p>{{ $t('docs.api.responseP1') }}</p>
      <DocsCodeBlock :code="responseExample" label="200 OK" />
    </DocsBlock>

    <DocsBlock :title="$t('docs.api.degradedTitle')" icon="alert-triangle">
      <p>{{ $t('docs.api.degradedP1') }}</p>
    </DocsBlock>

    <DocsBlock :title="$t('docs.api.targetTitle')" icon="check">
      <p>{{ $t('docs.api.targetP1') }}</p>
      <DocsCodeBlock :code="targetExample" label="cURL" />
    </DocsBlock>

    <DocsBlock :title="$t('docs.api.rateTitle')" icon="zap">
      <p>{{ $t('docs.api.rateP1') }}</p>
      <p>{{ $t('docs.api.rateP2') }}</p>
    </DocsBlock>

    <DocsBlock :title="$t('docs.api.errorsTitle')" icon="alert-triangle">
      <p>{{ $t('docs.api.errorsP1') }}</p>
      <DocsCodeBlock :code="errorExample" label="429" />
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-line text-xs text-subtle">
              <th class="py-2 pr-4 font-medium">{{ $t('docs.api.errCode') }}</th>
              <th class="py-2 pr-4 font-medium">{{ $t('docs.api.errMachineCode') }}</th>
              <th class="py-2 pr-4 font-medium">{{ $t('docs.api.errMeaning') }}</th>
              <th class="py-2 font-medium">{{ $t('docs.api.errFix') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="error in errors"
              :key="error.status"
              class="border-b border-line last:border-0"
            >
              <td class="py-3 pr-4 align-top">
                <UiBadge variant="danger">{{ error.status }}</UiBadge>
              </td>
              <td class="py-3 pr-4 align-top font-mono text-xs text-fg">{{ error.code }}</td>
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
