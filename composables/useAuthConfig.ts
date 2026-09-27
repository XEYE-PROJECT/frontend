import type { AuthConfig } from '~/types/api'

const FALLBACK: AuthConfig = {
  emailVerificationRequired: true,
  ssoProviders: [],
  captchaProvider: 'none',
  captchaSiteKey: null,
}

/** GET /auth/config, cargado una vez y compartido (proveedores SSO, CAPTCHA, verificación). */
export function useAuthConfig() {
  const config = useState<AuthConfig>('auth-config', () => FALLBACK)
  const loaded = useState<boolean>('auth-config-loaded', () => false)

  async function load() {
    if (loaded.value) return config.value
    const { $api } = useNuxtApp()
    try {
      config.value = await $api<AuthConfig>('/auth/config')
    } catch {
      config.value = FALLBACK
    } finally {
      loaded.value = true
    }
    return config.value
  }

  return { config, loaded, load }
}
