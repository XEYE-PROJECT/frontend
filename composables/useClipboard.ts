/** Copia al portapapeles con flag `copied` transitorio para feedback en botones. */
export function useClipboard(resetMs = 1500) {
  const copied = ref(false)

  async function copy(text: string): Promise<boolean> {
    if (!import.meta.client) return false
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true
      window.setTimeout(() => (copied.value = false), resetMs)
      return true
    } catch {
      return false
    }
  }

  return { copied, copy }
}
