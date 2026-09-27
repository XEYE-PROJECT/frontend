import type { ConsoleSearchPayload, ConsoleSearchResponse } from '~/types/api'

/**
 * Playground de búsqueda: POST /lists/{id}/search en el backend (sesión JWT). El backend
 * comprueba que la lista es tuya y reenvía la consulta al servicio de búsqueda por la red
 * interna, así la clave API nunca vive en el navegador y las listas privadas también se pueden
 * probar. Las integraciones reales llaman al servicio de búsqueda directamente con X-API-Key.
 */
export function useSearchApi() {
  const { $api } = useNuxtApp()

  function search(listId: number, payload: ConsoleSearchPayload): Promise<ConsoleSearchResponse> {
    return $api<ConsoleSearchResponse>(`/lists/${listId}/search`, { method: 'POST', body: payload })
  }

  return { search }
}
