import type { ApiKey, CreatedApiKey } from '~/types/api'

/** Endpoints de api keys del backend. Solo `create` devuelve el valor completo de la clave. */
export function useApiKeysApi() {
  const { $api } = useNuxtApp()

  return {
    all: () => $api<ApiKey[]>('/api-keys'),
    create: (name?: string) =>
      $api<CreatedApiKey>('/api-keys', { method: 'POST', body: { name } }),
    rename: (id: number, name: string) =>
      $api<ApiKey>(`/api-keys/${id}`, { method: 'PUT', body: { name } }),
    remove: (id: number) => $api<void>(`/api-keys/${id}`, { method: 'DELETE' }),
  }
}
