// Normaliza los errores de ofetch ($fetch), tanto del backend
// ({status,error,message,details}) como del servicio de búsqueda ({error,detail}).

type Translate = (key: string, params?: Record<string, string | number>) => string

interface AnyFetchError {
  status?: number
  statusCode?: number
  response?: { status?: number; _data?: unknown }
  data?: unknown
}

export function errorStatus(e: unknown): number | undefined {
  const err = e as AnyFetchError
  return err?.status ?? err?.statusCode ?? err?.response?.status
}

export function errorData(e: unknown): Record<string, unknown> | undefined {
  const err = e as AnyFetchError
  const data = err?.data ?? err?.response?._data
  return data && typeof data === 'object' ? (data as Record<string, unknown>) : undefined
}

/** Mensaje localizado y apto para el usuario a partir de cualquier error de API. */
export function apiErrorMessage(e: unknown, t: Translate): string {
  const data = errorData(e)
  const status = errorStatus(e)

  // El backend prioriza `message`; el servicio de búsqueda usa `detail` / `error`.
  if (data) {
    if (typeof data.message === 'string' && data.message) return data.message
    if (typeof data.detail === 'string' && data.detail) return data.detail
    if (typeof data.error === 'string' && data.error && !data.detail) return data.error
  }

  switch (status) {
    case 401:
      return t('errors.unauthorized')
    case 403:
      return t('errors.forbidden')
    case 404:
      return t('errors.notFound')
    case 409:
      return t('errors.conflict')
    case 400:
    case 422:
      return t('errors.validation')
    case 429:
      return t('search.errRateLimit')
  }
  if (status === undefined) return t('errors.network')
  return t('errors.generic')
}

/** Errores de validación por campo del mapa `details` del backend (si los hay). */
export function fieldErrors(e: unknown): Record<string, string> {
  const data = errorData(e)
  const details = data?.details
  if (details && typeof details === 'object') {
    return details as Record<string, string>
  }
  return {}
}
