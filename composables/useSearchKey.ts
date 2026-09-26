const STORAGE_KEY = 'xeye_search_key'

/**
 * Clave API que usa el playground de búsqueda. El backend ya no devuelve claves completas
 * (solo su prefijo), así que la clave la pega el usuario o llega de la pantalla de creación.
 * Vive en memoria y, como comodidad, en sessionStorage: solo esta pestaña, hasta cerrarla.
 */
export function useSearchKey() {
  const key = useState<string>('search-api-key', () => '')

  function init() {
    if (!import.meta.client || key.value) return
    try {
      key.value = sessionStorage.getItem(STORAGE_KEY) ?? ''
    } catch {
      /* sessionStorage no disponible: la clave solo vive en memoria */
    }
  }

  function set(value: string) {
    key.value = value.trim()
    if (!import.meta.client) return
    try {
      if (key.value) sessionStorage.setItem(STORAGE_KEY, key.value)
      else sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      /* idem */
    }
  }

  function clear() {
    set('')
  }

  return { key, init, set, clear }
}
