import type {
  CreateListPayload,
  ItemList,
  ListsQuery,
  Page,
  UpdateListPayload,
} from '~/types/api'

/** Endpoints de listas del backend. Llamar dentro de `setup` (captura el cliente API). */
export function useListsApi() {
  const { $api } = useNuxtApp()

  return {
    /** Página de listas del usuario (`limit` máximo 200; `q` y `public` filtran en el servidor). */
    list: (query: ListsQuery = {}) => $api<Page<ItemList>>('/lists', { query }),
    /** Las primeras 200 listas: para selectores y cuadros de mando (nadie tiene tantas hoy). */
    all: () => $api<Page<ItemList>>('/lists', { query: { limit: 200 } }).then((p) => p.items),
    get: (id: number) => $api<ItemList>(`/lists/${id}`),
    create: (body: CreateListPayload) => $api<ItemList>('/lists', { method: 'POST', body }),
    update: (id: number, body: UpdateListPayload) =>
      $api<ItemList>(`/lists/${id}`, { method: 'PUT', body }),
    remove: (id: number) => $api<void>(`/lists/${id}`, { method: 'DELETE' }),
  }
}
