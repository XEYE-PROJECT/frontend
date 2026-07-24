export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'xeye_theme'

/** Estado compartido de tema claro/oscuro; `.dark` en <html> activa los tokens. */
export function useTheme() {
  const theme = useState<ThemeMode>('theme', () => 'light')

  function apply(mode: ThemeMode) {
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', mode === 'dark')
    }
  }

  function setTheme(mode: ThemeMode) {
    theme.value = mode
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, mode)
    }
    apply(mode)
  }

  function toggle() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  return { theme, setTheme, toggle, apply, storageKey: STORAGE_KEY }
}
