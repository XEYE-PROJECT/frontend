import { describe, expect, it } from 'vitest'
import { useI18n } from '~/composables/useI18n'

describe('useI18n', () => {
  it('traduce claves anidadas en el idioma activo y cae al inglés o a la clave', () => {
    const { t, setLocale } = useI18n()
    setLocale('es')
    expect(t('nav.status')).not.toBe('nav.status')
    expect(t('clave.que.no.existe')).toBe('clave.que.no.existe')
    setLocale('en')
    expect(t('nav.status')).toMatch(/status/i)
  })

  it('interpola parámetros y deja los que faltan', () => {
    const { t, setLocale } = useI18n()
    setLocale('es')
    const text = t('pagination.range', { from: 1, to: 25, total: 100 })
    expect(text).toContain('1')
    expect(text).toContain('100')
    expect(text).not.toContain('{from}')
  })

  it('setLocale persiste y marca el lang del documento', () => {
    const { locale, setLocale, storageKey } = useI18n()
    setLocale('en')
    expect(locale.value).toBe('en')
    expect(localStorage.getItem(storageKey)).toBe('en')
    expect(document.documentElement.getAttribute('lang')).toBe('en')
    setLocale('es')
  })
})
