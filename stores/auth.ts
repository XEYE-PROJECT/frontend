import { defineStore } from 'pinia'
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  UpdateUserPayload,
  User,
} from '~/types/api'

const TOKEN_KEY = 'xeye_token'
const USER_KEY = 'xeye_user'

interface AuthState {
  token: string | null
  user: User | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    user: null,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token,
    displayName: (state): string => state.user?.name ?? '',
  },

  actions: {
    /** Hidrata la sesión desde localStorage (se llama una vez al arrancar el cliente). */
    init() {
      if (!import.meta.client) return
      const token = localStorage.getItem(TOKEN_KEY)
      const rawUser = localStorage.getItem(USER_KEY)
      if (token) this.token = token
      if (rawUser) {
        try {
          this.user = JSON.parse(rawUser) as User
        } catch {
          this.user = null
        }
      }
    },

    setSession(auth: AuthResponse) {
      this.token = auth.token
      this.user = auth.user
      if (import.meta.client) {
        localStorage.setItem(TOKEN_KEY, auth.token)
        localStorage.setItem(USER_KEY, JSON.stringify(auth.user))
      }
    },

    setUser(user: User) {
      this.user = user
      if (import.meta.client) {
        localStorage.setItem(USER_KEY, JSON.stringify(user))
      }
    },

    clearSession() {
      this.token = null
      this.user = null
      if (import.meta.client) {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      }
    },

    async login(payload: LoginPayload) {
      const { $api } = useNuxtApp()
      const auth = await $api<AuthResponse>('/auth/login', { method: 'POST', body: payload })
      this.setSession(auth)
      return auth
    },

    async register(payload: RegisterPayload) {
      const { $api } = useNuxtApp()
      const auth = await $api<AuthResponse>('/auth/register', { method: 'POST', body: payload })
      this.setSession(auth)
      return auth
    },

    async fetchMe() {
      const { $api } = useNuxtApp()
      const user = await $api<User>('/users/me')
      this.setUser(user)
      return user
    },

    async updateProfile(payload: UpdateUserPayload) {
      const { $api } = useNuxtApp()
      const user = await $api<User>('/users/me', { method: 'PUT', body: payload })
      this.setUser(user)
      return user
    },

    async deleteAccount() {
      const { $api } = useNuxtApp()
      await $api('/users/me', { method: 'DELETE' })
      this.clearSession()
    },

    async logout() {
      this.clearSession()
      await navigateTo('/login')
    },
  },
})
