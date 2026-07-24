import { en, type Messages } from './en'
import { es } from './es'

export type Locale = 'es' | 'en'

export const messages: Record<Locale, Messages> = { es, en }

export const locales: { code: Locale; label: string }[] = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
]

export const defaultLocale: Locale = 'es'

export type { Messages }
