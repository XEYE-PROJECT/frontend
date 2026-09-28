<script setup lang="ts">
// Página pública de estado: comprueba en vivo, desde el navegador, las sondas públicas de cada
// servicio (backend: /actuator/health; buscador: /ready). La consola está operativa por el
// mero hecho de haberse cargado. No sustituye al monitor externo (que vigila 24/7 y guarda el
// historial): lo enlaza si NUXT_PUBLIC_STATUS_PAGE_URL está configurada.
definePageMeta({ layout: 'docs-public' })

const { t } = useI18n()
const config = useRuntimeConfig()

useHead({ title: () => `${t('status.title')} · XEYE` })

type State = 'checking' | 'ok' | 'degraded' | 'down'
interface Check {
  key: 'console' | 'backend' | 'search'
  state: State
  latencyMs: number | null
  detail: string
}

const backendUrl = String(config.public.backendUrl).replace(/\/+$/, '')
const searchUrl = String(config.public.searchUrl).replace(/\/+$/, '')
const externalUrl = String(config.public.statusPageUrl || '')

const checks = ref<Check[]>([
  { key: 'console', state: 'ok', latencyMs: null, detail: '' },
  { key: 'backend', state: 'checking', latencyMs: null, detail: '' },
  { key: 'search', state: 'checking', latencyMs: null, detail: '' },
])
const lastChecked = ref<Date | null>(null)
const running = ref(false)

const overall = computed<State>(() => {
  const states = checks.value.map((c) => c.state)
  if (states.includes('checking')) return 'checking'
  if (states.includes('down')) return 'down'
  if (states.includes('degraded')) return 'degraded'
  return 'ok'
})

function set(key: Check['key'], patch: Partial<Check>) {
  const target = checks.value.find((c) => c.key === key)
  if (target) Object.assign(target, patch)
}

async function probe(url: string): Promise<{ status: number; body: Record<string, unknown> | null; ms: number }> {
  const started = performance.now()
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 6000)
  try {
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' })
    let body: Record<string, unknown> | null = null
    try {
      body = (await res.json()) as Record<string, unknown>
    } catch {
      body = null
    }
    return { status: res.status, body, ms: Math.round(performance.now() - started) }
  } finally {
    window.clearTimeout(timer)
  }
}

async function checkBackend() {
  set('backend', { state: 'checking', detail: '' })
  try {
    const { status, body, ms } = await probe(`${backendUrl}/actuator/health`)
    const up = status === 200 && body?.status === 'UP'
    set('backend', { state: up ? 'ok' : 'down', latencyMs: ms, detail: up ? '' : `HTTP ${status}` })
  } catch {
    set('backend', { state: 'down', latencyMs: null, detail: t('status.unreachable') })
  }
}

async function checkSearch() {
  set('search', { state: 'checking', detail: '' })
  try {
    const { status, body, ms } = await probe(`${searchUrl}/ready`)
    if (status === 200 && body?.ready === true) {
      const reasons = Object.entries((body.checks as Record<string, string>) || {})
        .filter(([, v]) => v !== 'ok')
        .map(([k, v]) => `${k}: ${v}`)
      const degraded = body.degraded === true
      set('search', {
        state: degraded ? 'degraded' : 'ok',
        latencyMs: ms,
        detail: degraded ? t('status.degradedHint', { reasons: reasons.join(', ') || '—' }) : '',
      })
    } else if (status === 503) {
      set('search', { state: 'down', latencyMs: ms, detail: t('status.notReady') })
    } else {
      set('search', { state: 'down', latencyMs: ms, detail: `HTTP ${status}` })
    }
  } catch {
    set('search', { state: 'down', latencyMs: null, detail: t('status.unreachable') })
  }
}

async function runChecks() {
  if (running.value) return
  running.value = true
  try {
    await Promise.all([checkBackend(), checkSearch()])
    lastChecked.value = new Date()
  } finally {
    running.value = false
  }
}

const badge: Record<State, { alert: 'success' | 'warning' | 'danger' | 'info'; badge: 'success' | 'warning' | 'danger' | 'neutral'; icon: string }> = {
  ok: { alert: 'success', badge: 'success', icon: 'check' },
  degraded: { alert: 'warning', badge: 'warning', icon: 'info' },
  down: { alert: 'danger', badge: 'danger', icon: 'x' },
  checking: { alert: 'info', badge: 'neutral', icon: 'loader' },
}

let timer: number | undefined
onMounted(() => {
  runChecks()
  timer = window.setInterval(runChecks, 60_000)
})
onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})

function timeLabel(d: Date) {
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-fg">{{ $t('status.title') }}</h1>
        <p class="mt-1.5 text-sm text-muted">{{ $t('status.subtitle') }}</p>
      </div>
      <UiButton variant="secondary" size="sm" icon="refresh" :loading="running" @click="runChecks">
        {{ $t('status.refresh') }}
      </UiButton>
    </div>

    <UiAlert class="mt-6" :variant="badge[overall].alert" :icon="badge[overall].icon">
      <span class="font-medium">{{ $t(`status.overall.${overall}`) }}</span>
      <span v-if="lastChecked" class="ml-2 text-xs opacity-80">
        {{ $t('status.lastChecked', { time: timeLabel(lastChecked) }) }}
      </span>
    </UiAlert>

    <ul class="mt-6 space-y-3">
      <li
        v-for="check in checks"
        :key="check.key"
        class="flex items-start justify-between gap-4 rounded-xl border border-line bg-surface p-4"
      >
        <div class="min-w-0">
          <p class="font-medium text-fg">{{ $t(`status.services.${check.key}`) }}</p>
          <p class="mt-0.5 text-sm text-muted">{{ $t(`status.services.${check.key}Desc`) }}</p>
          <p v-if="check.detail" class="mt-2 text-sm text-muted">{{ check.detail }}</p>
        </div>
        <div class="shrink-0 text-right">
          <UiBadge :variant="badge[check.state].badge">
            <UiIcon :name="badge[check.state].icon" :size="14" :class="check.state === 'checking' ? 'animate-spin' : ''" />
            {{ $t(`status.states.${check.state}`) }}
          </UiBadge>
          <p v-if="check.latencyMs !== null" class="mt-1 font-mono text-xs text-muted">
            {{ $t('status.latency', { ms: check.latencyMs }) }}
          </p>
        </div>
      </li>
    </ul>

    <p class="mt-6 text-sm text-muted">
      {{ $t('status.note') }}
      <a v-if="externalUrl" :href="externalUrl" target="_blank" rel="noopener" class="font-medium text-primary hover:underline">
        {{ $t('status.externalPage') }}
      </a>
    </p>
  </div>
</template>
