import type { SearchPayload, SearchResponse } from '~/types/api'

/**
 * Llama al microservicio de búsqueda DIRECTAMENTE (sin pasar por el backend),
 * igual que una integración real: POST {searchUrl}/api/v1/search con X-API-Key.
 */
export function useSearchApi() {
  const config = useRuntimeConfig()

  function search(apiKey: string, payload: SearchPayload): Promise<SearchResponse> {
    return $fetch<SearchResponse>('/api/v1/search', {
      baseURL: config.public.searchUrl,
      method: 'POST',
      headers: { 'X-API-Key': apiKey },
      body: { register_log: false, ...payload },
    })
  }

  return { search }
}
