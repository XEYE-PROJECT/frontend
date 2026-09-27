// Normaliza los errores de ofetch ($fetch). El backend y el servicio de búsqueda comparten el
// sobre {status, error, code, message, details?}; se toleran cuerpos antiguos ({error, detail}).

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

  // `message` es el texto para humanos; `detail`/`error` solo por compatibilidad con cuerpos antiguos.
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
      return t('errors.rateLimited', { seconds: retryAfterSeconds(e) ?? 60 })
    case 503:
      return t('errors.unavailable')
  }
  if (status === undefined) return t('errors.network')
  return t('errors.generic')
}

/** Código estable del error del backend (`code`), si lo trae. */
export function errorCode(e: unknown): string | undefined {
  const code = errorData(e)?.code
  return typeof code === 'string' ? code : undefined
}

/** Segundos del `Retry-After` de un 429 (o undefined). */
export function retryAfterSeconds(e: unknown): number | undefined {
  const err = e as { response?: { headers?: Headers } }
  const raw = err?.response?.headers?.get?.('Retry-After')
  const n = raw ? Number(raw) : NaN
  return Number.isFinite(n) ? n : undefined
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
