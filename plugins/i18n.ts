import type { Locale } from '~/locales'

// Restaura el idioma guardado y expone el helper reactivo `$t` para templates.
export default defineNuxtPlugin(() => {
  const { t, locale, storageKey } = useI18n()

  if (import.meta.client) {
    const saved = localStorage.getItem(storageKey)
    if (saved === 'es' || saved === 'en') {
      locale.value = saved as Locale
    }
    document.documentElement.setAttribute('lang', locale.value)
  }

  return {
    provide: { t },
  }
})
