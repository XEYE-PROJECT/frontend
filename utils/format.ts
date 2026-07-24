import type { Locale } from '~/locales'

const localeTag: Record<Locale, string> = { es: 'es-ES', en: 'en-US' }

/** Fecha absoluta tipo "7 jul 2026". */
export function formatDate(value: string | number | Date | null | undefined, locale: Locale): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(localeTag[locale], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

/** Fecha y hora, para vistas de detalle. */
export function formatDateTime(value: string | number | Date | null | undefined, locale: Locale): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(localeTag[locale], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/** Tiempo relativo compacto tipo "hace 3 h". */
export function formatRelative(value: string | number | Date | null | undefined, locale: Locale): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const diffMs = date.getTime() - Date.now()
  const rtf = new Intl.RelativeTimeFormat(localeTag[locale], { numeric: 'auto', style: 'short' })
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000000],
    ['month', 2592000000],
    ['day', 86400000],
    ['hour', 3600000],
    ['minute', 60000],
  ]
  for (const [unit, ms] of units) {
    if (Math.abs(diffMs) >= ms) {
      return rtf.format(Math.round(diffMs / ms), unit)
    }
  }
  return rtf.format(0, 'second')
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(localeTag[locale]).format(value)
}

/** Coste en USD con hasta 4 decimales; "—" si es null. */
export function formatCost(value: number | null | undefined, locale: Locale): string {
  if (value == null) return '—'
  return new Intl.NumberFormat(localeTag[locale], {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 4,
  }).format(value)
}

/**
 * Modelo de embeddings de un entrenamiento. El campo `model` del backend es el JSON
 * opaco del worker ('{"embedding_model": "...", ...}'); en la UI solo interesa
 * el modelo de embeddings.
 */
export function embeddingModelName(model: string | null | undefined): string {
  if (!model) return '—'
  try {
    const parsed = JSON.parse(model)
    if (parsed && typeof parsed === 'object' && typeof parsed.embedding_model === 'string') {
      return parsed.embedding_model
    }
  } catch {
    // Los entrenamientos legacy/mock guardan un string plano.
  }
  return model
}

/** Formatea lo mejor posible el string opaco `params` de un elemento. */
export function prettyParams(raw: unknown): string {
  if (raw == null) return ''
  if (typeof raw !== 'string') {
    try {
      return JSON.stringify(raw, null, 2)
    } catch {
      return String(raw)
    }
  }
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
}

/** True si el string es JSON parseable (valida el campo params). */
export function isValidJson(value: string): boolean {
  if (!value.trim()) return true
  try {
    JSON.parse(value)
    return true
  } catch {
    return false
  }
}

/** Tono 0–360 determinista a partir de un string, para acentos de avatar/lista. */
export function hueFromString(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % 360
}

export function initials(name?: string | null, surname?: string | null): string {
  const a = (name ?? '').trim().charAt(0)
  const b = (surname ?? '').trim().charAt(0)
  return (a + b).toUpperCase() || '·'
}
