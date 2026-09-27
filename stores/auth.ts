import { defineStore } from 'pinia'
import type {
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
  LoginResponse,
  MessageResponse,
  RegisterPayload,
  UpdateUserPayload,
  User,
} from '~/types/api'

// Solo el token y su caducidad se persisten (localStorage); el perfil se pide al backend en
// cada arranque (GET /users/me), así nunca queda un perfil obsoleto o manipulado en el navegador.
const TOKEN_KEY = 'xeye_token'
const EXPIRES_KEY = 'xeye_token_expires_at'

interface AuthState {
  token: string | null
  /** Epoch ms en que caduca el token (del `expiresInMinutes` del backend). */
  expiresAt: number | null
  user: User | null
  /** true tras el primer intento de cargar el perfil (aunque falle). */
  ready: boolean
}

let expiryTimer: number | undefined

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    expiresAt: null,
    user: null,
    ready: false,
  }),

  getters: {
    isAuthenticated: (state): boolean =>
      !!state.token && (state.expiresAt == null || state.expiresAt > Date.now()),
    isAdmin: (state): boolean => state.user?.permission === 'admin',
    displayName: (state): string => state.user?.name ?? '',
  },

  actions: {
    /** Hidrata el token desde localStorage (una vez al arrancar el cliente); descarta los caducados. */
    init() {
      if (!import.meta.client) return
      try {
        const token = localStorage.getItem(TOKEN_KEY)
        const expires = Number(localStorage.getItem(EXPIRES_KEY))
        if (token && (!expires || expires > Date.now())) {
          this.token = token
          this.expiresAt = expires || null
          this.scheduleExpiry()
        } else {
          this.clearSession()
        }
      } catch {
        this.clearSession()
      }
    },

    setSession(auth: AuthResponse) {
      this.token = auth.token
      this.expiresAt = Date.now() + auth.expiresInMinutes * 60_000
      this.user = auth.user
      this.ready = true
      if (import.meta.client) {
        try {
          localStorage.setItem(TOKEN_KEY, auth.token)
          localStorage.setItem(EXPIRES_KEY, String(this.expiresAt))
        } catch {
          /* almacenamiento bloqueado: la sesión dura lo que dure la pestaña */
        }
      }
      this.scheduleExpiry()
    },

    /** Aplica la respuesta de un login: abre sesión si no hay 2FA pendiente. @return true si hay sesión. */
    applyLoginResponse(res: LoginResponse): boolean {
      if (res.mfaRequired || !res.token || !res.user) return false
      this.setSession({
        token: res.token,
        tokenType: res.tokenType ?? 'Bearer',
        expiresInMinutes: res.expiresInMinutes ?? 60,
        user: res.user,
      })
      return true
    },

    setUser(user: User) {
      this.user = user
      this.ready = true
    },

    clearSession() {
      this.token = null
      this.expiresAt = null
      this.user = null
      if (import.meta.client) {
        try {
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(EXPIRES_KEY)
          // Restos de versiones anteriores que guardaban el perfil.
          localStorage.removeItem('xeye_user')
        } catch {
          /* ignorar */
        }
        if (expiryTimer) window.clearTimeout(expiryTimer)
      }
    },

    /** Cierra la sesión localmente justo al caducar el token y manda a /login conservando la ruta. */
    scheduleExpiry() {
      if (!import.meta.client || !this.expiresAt) return
      if (expiryTimer) window.clearTimeout(expiryTimer)
      const delay = Math.max(0, this.expiresAt - Date.now())
      // setTimeout no admite más de ~24,8 días.
      if (delay > 2_000_000_000) return
      expiryTimer = window.setTimeout(() => {
        if (!this.token) return
        this.clearSession()
        const route = useRoute()
        navigateTo({ path: '/login', query: { redirect: route.fullPath, reason: 'expired' } })
      }, delay)
    },

    async login(payload: LoginPayload): Promise<LoginResponse> {
      const { $api } = useNuxtApp()
      const res = await $api<LoginResponse>('/auth/login', { method: 'POST', body: payload })
      this.applyLoginResponse(res)
      return res
    },

    async verifyMfa(mfaToken: string, code: string): Promise<AuthResponse> {
      const { $api } = useNuxtApp()
      const auth = await $api<AuthResponse>('/auth/mfa', { method: 'POST', body: { mfaToken, code } })
      this.setSession(auth)
      return auth
    },

    /** El registro no abre sesión: hay que verificar el email (el backend responde 202 siempre). */
    async register(payload: RegisterPayload): Promise<MessageResponse> {
      const { $api } = useNuxtApp()
      return await $api<MessageResponse>('/auth/register', { method: 'POST', body: payload })
    },

    async verifyEmail(token: string): Promise<LoginResponse> {
      const { $api } = useNuxtApp()
      const res = await $api<LoginResponse>('/auth/verify-email', { method: 'POST', body: { token } })
      this.applyLoginResponse(res)
      return res
    },

    async exchangeSsoCode(code: string): Promise<LoginResponse> {
      const { $api } = useNuxtApp()
      const res = await $api<LoginResponse>('/auth/sso/exchange', {
        method: 'POST',
        body: { token: code },
      })
      this.applyLoginResponse(res)
      return res
    },

    async fetchMe() {
      const { $api } = useNuxtApp()
      try {
        const user = await $api<User>('/users/me')
        this.setUser(user)
        return user
      } finally {
        this.ready = true
      }
    },

    async updateProfile(payload: UpdateUserPayload) {
      const { $api } = useNuxtApp()
      const user = await $api<User>('/users/me', { method: 'PUT', body: payload })
      this.setUser(user)
      return user
    },

    /** Cambia la contraseña; el backend cierra las demás sesiones y devuelve un token nuevo para esta. */
    async changePassword(payload: ChangePasswordPayload) {
      const { $api } = useNuxtApp()
      const auth = await $api<AuthResponse>('/users/me/password', { method: 'PUT', body: payload })
      this.setSession(auth)
      return auth
    },

    async deleteAccount() {
      const { $api } = useNuxtApp()
      await $api('/users/me', { method: 'DELETE' })
      this.clearSession()
    },

    /** Revoca el token en el servidor (best-effort) y limpia la sesión local. */
    async logout() {
      const { $api } = useNuxtApp()
      if (this.token) {
        try {
          await $api('/auth/logout', { method: 'POST' })
        } catch {
          /* el token ya no vale o no hay red: la limpieza local basta */
        }
      }
      this.clearSession()
      await navigateTo('/login')
    },

    /** Cierra TODAS las sesiones del usuario (incluida esta). */
    async logoutAll() {
      const { $api } = useNuxtApp()
      await $api('/auth/logout-all', { method: 'POST' })
      this.clearSession()
      await navigateTo('/login')
    },
  },
})
