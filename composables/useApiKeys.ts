import type { ApiKey } from '~/types/api'

/** Endpoints de api keys del backend. */
export function useApiKeysApi() {
  const { $api } = useNuxtApp()

  return {
    all: () => $api<ApiKey[]>('/api-keys'),
    create: (name?: string) => $api<ApiKey>('/api-keys', { method: 'POST', body: { name } }),
    rename: (id: number, name: string) =>
      $api<ApiKey>(`/api-keys/${id}`, { method: 'PUT', body: { name } }),
    remove: (id: number) => $api<void>(`/api-keys/${id}`, { method: 'DELETE' }),
  }
}
