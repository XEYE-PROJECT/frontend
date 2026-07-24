import type { CreateListPayload, ItemList, UpdateListPayload } from '~/types/api'

/** Endpoints de listas del backend. Llamar dentro de `setup` (captura el cliente API). */
export function useListsApi() {
  const { $api } = useNuxtApp()

  return {
    all: () => $api<ItemList[]>('/lists'),
    get: (id: number) => $api<ItemList>(`/lists/${id}`),
    create: (body: CreateListPayload) => $api<ItemList>('/lists', { method: 'POST', body }),
    update: (id: number, body: UpdateListPayload) =>
      $api<ItemList>(`/lists/${id}`, { method: 'PUT', body }),
    remove: (id: number) => $api<void>(`/lists/${id}`, { method: 'DELETE' }),
  }
}
