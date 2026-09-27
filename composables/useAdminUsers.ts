import type { AdminUpdateUserPayload, AdminUser, AdminUserPage } from '~/types/api'

/** Endpoints de administración de cuentas (solo admin; el backend responde 403 al resto). */
export function useAdminUsersApi() {
  const { $api } = useNuxtApp()

  return {
    list: (offset = 0, limit = 50) =>
      $api<AdminUserPage>('/admin/users', { query: { offset, limit } }),
    update: (id: number, payload: AdminUpdateUserPayload) =>
      $api<AdminUser>(`/admin/users/${id}`, { method: 'PUT', body: payload }),
    remove: (id: number) => $api<void>(`/admin/users/${id}`, { method: 'DELETE' }),
    logoutAll: (id: number) => $api<void>(`/admin/users/${id}/logout-all`, { method: 'POST' }),
  }
}
