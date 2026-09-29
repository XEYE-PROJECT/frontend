<script setup lang="ts">
// Retorno del SSO: el backend redirige aquí con `?code=` (código de un solo uso, 60 s) o `?error=`.
definePageMeta({ layout: 'auth' })

const { t } = useI18n()
const auth = useAuthStore()
const route = useRoute()

const errorMsg = ref('')
const working = ref(true)

useHead({ title: () => `${t('auth.ssoTitle')} · XEYE` })

const SSO_ERRORS: Record<string, string> = {
  SSO_CANCELLED: 'auth.ssoCancelled',
  SSO_EMAIL_UNVERIFIED: 'auth.ssoEmailUnverified',
  SSO_NO_EMAIL: 'auth.ssoNoEmail',
  ACCOUNT_LOCKED: 'auth.ssoLocked',
}

onMounted(async () => {
  const code = route.query.code as string | undefined
  const error = route.query.error as string | undefined
  if (error || !code) {
    working.value = false
    errorMsg.value = t(SSO_ERRORS[error ?? ''] ?? 'auth.ssoFailed')
    return
  }
  try {
    const res = await auth.exchangeSsoCode(code)
    if (res.mfaRequired) {
      // Cuenta con 2FA: el reto TOTP necesita el flujo del login normal.
      await navigateTo({ path: '/login', query: { reason: 'mfa-sso' } })
      return
    }
    await navigateTo('/dashboard')
  } catch (e) {
    working.value = false
    errorMsg.value =
      errorCode(e) === 'SSO_CODE_INVALID' ? t('auth.ssoCodeInvalid') : apiErrorMessage(e, t)
  }
})
</script>

<template>
  <div>
    <div class="mb-8 lg:hidden">
      <UiLogo />
    </div>
    <div v-if="working" class="flex items-center gap-3 text-sm text-muted">
      <UiSpinner /> {{ $t('auth.ssoWorking') }}
    </div>
    <template v-else>
      <h1 class="text-2xl font-semibold tracking-tight text-fg">{{ $t('auth.ssoTitle') }}</h1>
      <UiAlert class="mt-6" variant="danger">{{ errorMsg }}</UiAlert>
      <UiButton class="mt-6" block variant="secondary" to="/login">{{
        $t('auth.backToLogin')
      }}</UiButton>
    </template>
  </div>
</template>
