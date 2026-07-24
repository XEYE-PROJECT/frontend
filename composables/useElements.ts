import type {
  CreateElementPayload,
  Element,
  ImportElementsPayload,
  UpdateElementPayload,
} from '~/types/api'

/** Endpoints de elementos: se listan/crean bajo una lista y se editan/borran por id. */
export function useElementsApi() {
  const { $api } = useNuxtApp()

  return {
    listByList: (listId: number) => $api<Element[]>(`/lists/${listId}/elements`),
    create: (listId: number, body: CreateElementPayload) =>
      $api<Element>(`/lists/${listId}/elements`, { method: 'POST', body }),
    importElements: (listId: number, body: ImportElementsPayload) =>
      $api<Element[]>(`/lists/${listId}/elements/import`, { method: 'POST', body }),
    update: (id: number, body: UpdateElementPayload) =>
      $api<Element>(`/elements/${id}`, { method: 'PUT', body }),
    remove: (id: number) => $api<void>(`/elements/${id}`, { method: 'DELETE' }),
  }
}
