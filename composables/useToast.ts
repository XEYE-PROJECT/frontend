export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  type: ToastType
  message: string
}

let counter = 0

export function useToasts() {
  return useState<Toast[]>('toasts', () => [])
}

/** Toasts globales ligeros; se autodescartan tras `timeout` ms (0 = fijo). */
export function useToast() {
  const toasts = useToasts()

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function push(type: ToastType, message: string, timeout = 4000): number {
    const id = ++counter
    toasts.value = [...toasts.value, { id, type, message }]
    if (import.meta.client && timeout > 0) {
      window.setTimeout(() => dismiss(id), timeout)
    }
    return id
  }

  return {
    toasts,
    dismiss,
    success: (message: string, timeout?: number) => push('success', message, timeout),
    error: (message: string, timeout?: number) => push('error', message, timeout),
    info: (message: string, timeout?: number) => push('info', message, timeout),
  }
}
