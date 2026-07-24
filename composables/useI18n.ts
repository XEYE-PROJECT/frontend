import { defaultLocale, locales, messages, type Locale } from '~/locales'

const STORAGE_KEY = 'xeye_locale'

/** Ref de idioma compartida (instancia única en toda la app). */
export function useLocale() {
  return useState<Locale>('locale', () => defaultLocale)
}

function resolve(tree: unknown, key: string): string | undefined {
  const value = key
    .split('.')
    .reduce<unknown>(
      (acc, part) =>
        acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[part] : undefined,
      tree,
    )
  return typeof value === 'string' ? value : undefined
}

/**
 * Mini i18n reactivo: `t(key)` lee la ref de idioma compartida, así cualquier
 * template que lo use se re-renderiza al cambiar el idioma. Interpola
 * `{placeholders}` desde `params`.
 */
export function useI18n() {
  const locale = useLocale()

  function t(key: string, params?: Record<string, string | number>): string {
    const raw = resolve(messages[locale.value], key) ?? resolve(messages.en, key) ?? key
    if (!params) return raw
    return raw.replace(/\{(\w+)\}/g, (_, name: string) =>
      params[name] != null ? String(params[name]) : `{${name}}`,
    )
  }

  function setLocale(code: Locale) {
    locale.value = code
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, code)
      document.documentElement.setAttribute('lang', code)
    }
  }

  return { locale, t, setLocale, locales, storageKey: STORAGE_KEY }
}
