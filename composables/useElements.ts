import type {
  CreateElementPayload,
  Element,
  ElementsQuery,
  ImportElementsPayload,
  Page,
  UpdateElementPayload,
} from '~/types/api'

/** Endpoints de elementos: se listan/crean bajo una lista y se editan/borran por id. */
export function useElementsApi() {
  const { $api } = useNuxtApp()

  return {
    /** Página de elementos de la lista (`limit` máximo 200; `q` filtra por texto/descripción). */
    listByList: (listId: number, query: ElementsQuery = {}) =>
      $api<Page<Element>>(`/lists/${listId}/elements`, { query }),
    create: (listId: number, body: CreateElementPayload) =>
      $api<Element>(`/lists/${listId}/elements`, { method: 'POST', body }),
    importElements: (listId: number, body: ImportElementsPayload) =>
      $api<Element[]>(`/lists/${listId}/elements/import`, { method: 'POST', body }),
    update: (id: number, body: UpdateElementPayload) =>
      $api<Element>(`/elements/${id}`, { method: 'PUT', body }),
    remove: (id: number) => $api<unknown>(`/elements/${id}`, { method: 'DELETE' }),
  }
}
