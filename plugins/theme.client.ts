import type { ThemeMode } from '~/composables/useTheme'

// Sincroniza el estado reactivo del tema con lo que ya aplicó el script inline
// del head (preferencia guardada o la del SO); así el icono del toggle es fiel.
export default defineNuxtPlugin(() => {
  const { theme, apply, storageKey } = useTheme()

  const saved = localStorage.getItem(storageKey)
  const mode: ThemeMode =
    saved === 'dark' || saved === 'light'
      ? saved
      : window.matchMedia?.('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'

  theme.value = mode
  apply(mode)
})
