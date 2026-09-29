import type { ApiKey, CreatedApiKey, Page, PageQuery } from '~/types/api'

/** Endpoints de api keys del backend. Solo `create` devuelve el valor completo de la clave. */
export function useApiKeysApi() {
  const { $api } = useNuxtApp()

  return {
    /** Página de claves del usuario (`limit` máximo 200). */
    list: (query: PageQuery = {}) => $api<Page<ApiKey>>('/api-keys', { query }),
    create: (name?: string) => $api<CreatedApiKey>('/api-keys', { method: 'POST', body: { name } }),
    rename: (id: number, name: string) =>
      $api<ApiKey>(`/api-keys/${id}`, { method: 'PUT', body: { name } }),
    remove: (id: number) => $api<unknown>(`/api-keys/${id}`, { method: 'DELETE' }),
  }
}
