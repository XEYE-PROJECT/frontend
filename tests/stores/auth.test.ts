import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '~/stores/auth'
import type { User } from '~/types/api'

const user = {
  id: 1,
  name: 'Ana',
  surname: 'IT',
  email: 'ana@it.local',
  permission: 'user',
} as unknown as User

registerEndpoint('/backend/auth/login', {
  method: 'POST',
  handler: () => ({
    mfaRequired: false,
    token: 'jwt-de-prueba',
    tokenType: 'Bearer',
    expiresInMinutes: 60,
    user,
  }),
})
registerEndpoint('/backend/users/me', () => ({ ...user, name: 'Ana (servidor)' }))

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('arranca sin sesión', () => {
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.isAdmin).toBe(false)
    expect(auth.displayName).toBe('')
  })

  it('setSession guarda token y caducidad, y solo el token en localStorage', () => {
    const auth = useAuthStore()
    auth.setSession({ token: 't', tokenType: 'Bearer', expiresInMinutes: 60, user })
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.expiresAt).toBeGreaterThan(Date.now())
    expect(localStorage.getItem('xeye_token')).toBe('t')
    expect(localStorage.getItem('xeye_user')).toBeNull()
  })

  it('un token caducado no cuenta como sesión y init lo descarta', () => {
    localStorage.setItem('xeye_token', 'viejo')
    localStorage.setItem('xeye_token_expires_at', String(Date.now() - 1000))
    const auth = useAuthStore()
    auth.init()
    expect(auth.token).toBeNull()
    expect(localStorage.getItem('xeye_token')).toBeNull()
  })

  it('applyLoginResponse no abre sesión con 2FA pendiente', () => {
    const auth = useAuthStore()
    expect(auth.applyLoginResponse({ mfaRequired: true, mfaToken: 'mfa' })).toBe(false)
    expect(auth.isAuthenticated).toBe(false)
  })

  it('login contra la API abre sesión y fetchMe refresca el perfil', async () => {
    const auth = useAuthStore()
    const res = await auth.login({ email: user.email, password: 'secreto123' })
    expect(res.token).toBe('jwt-de-prueba')
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.displayName).toBe('Ana')

    await auth.fetchMe()
    expect(auth.displayName).toBe('Ana (servidor)')
    expect(auth.ready).toBe(true)
  })

  it('isAdmin depende del permiso del usuario', () => {
    const auth = useAuthStore()
    auth.setUser({ ...user, permission: 'admin' } as User)
    expect(auth.isAdmin).toBe(true)
  })

  it('clearSession borra todo', () => {
    const auth = useAuthStore()
    auth.setSession({ token: 't', tokenType: 'Bearer', expiresInMinutes: 60, user })
    auth.clearSession()
    expect(auth.token).toBeNull()
    expect(auth.user).toBeNull()
    expect(localStorage.getItem('xeye_token')).toBeNull()
  })
})
