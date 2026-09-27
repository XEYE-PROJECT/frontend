<script setup lang="ts">
// Widget de Cloudflare Turnstile. Solo se renderiza (y solo se carga el script externo) cuando el
// backend anuncia un site key en GET /auth/config; emite el token que hay que enviar como
// `captchaToken`. El script está permitido en la CSP (challenges.cloudflare.com).
const props = defineProps<{ siteKey: string }>()
const token = defineModel<string | null>({ default: null })

const { locale } = useI18n()
const container = ref<HTMLElement | null>(null)
let widgetId: string | undefined

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      reset: (id?: string) => void
      remove: (id?: string) => void
    }
  }
}

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-turnstile]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      return
    }
    const s = document.createElement('script')
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    s.async = true
    s.defer = true
    s.dataset.turnstile = 'true'
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('turnstile load failed'))
    document.head.appendChild(s)
  })
}

onMounted(async () => {
  try {
    await loadScript()
    if (!container.value || !window.turnstile) return
    widgetId = window.turnstile.render(container.value, {
      sitekey: props.siteKey,
      language: locale.value,
      callback: (t: string) => (token.value = t),
      'expired-callback': () => (token.value = null),
      'error-callback': () => (token.value = null),
    })
  } catch {
    token.value = null
  }
})

onBeforeUnmount(() => {
  if (widgetId && window.turnstile) window.turnstile.remove(widgetId)
})

/** Tras un envío (correcto o fallido) el token ya no vale: hay que pedir otro. */
function reset() {
  token.value = null
  if (widgetId && window.turnstile) window.turnstile.reset(widgetId)
}

defineExpose({ reset })
</script>

<template>
  <div ref="container" class="min-h-[65px]" />
</template>
