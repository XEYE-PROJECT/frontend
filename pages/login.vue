<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { t } = useI18n()
const auth = useAuthStore()
const route = useRoute()
const { config: authConfig, load: loadAuthConfig } = useAuthConfig()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const errorMsg = ref('')
const infoMsg = ref('')
const captchaToken = ref<string | null>(null)
const turnstile = ref<{ reset: () => void } | null>(null)

// Estados especiales: email sin verificar (ofrecer reenvío) y segundo factor pendiente.
const unverified = ref(false)
const resending = ref(false)
const mfaToken = ref<string | null>(null)
const mfaCode = ref('')

useHead({ title: () => `${t('auth.signIn')} · XEYE` })
await loadAuthConfig()

const reason = route.query.reason as string | undefined
if (reason === 'expired') infoMsg.value = t('auth.sessionExpired')
if (reason === 'mfa') infoMsg.value = t('auth.mfaJustEnabled')
if (reason === 'password-reset') infoMsg.value = t('auth.passwordResetDone')
if (reason === 'email-changed') infoMsg.value = t('auth.emailChangedRelogin')
if (reason === 'mfa-sso') infoMsg.value = t('auth.mfaSsoHint')
if (route.query.registered) infoMsg.value = t('auth.registeredNoVerify')

const redirectTarget = computed(() => {
  const r = route.query.redirect as string | undefined
  return r && r.startsWith('/') && !r.startsWith('//') ? r : '/dashboard'
})

const needsCaptcha = computed(() => authConfig.value.captchaProvider !== 'none' && !!authConfig.value.captchaSiteKey)

async function submit() {
  loading.value = true
  errorMsg.value = ''
  unverified.value = false
  try {
    const res = await auth.login({
      email: form.email,
      password: form.password,
      captchaToken: captchaToken.value,
    })
    if (res.mfaRequired && res.mfaToken) {
      mfaToken.value = res.mfaToken
      return
    }
    await navigateTo(redirectTarget.value)
  } catch (e) {
    turnstile.value?.reset()
    const code = errorCode(e)
    if (code === 'EMAIL_NOT_VERIFIED') {
      unverified.value = true
      errorMsg.value = t('auth.emailNotVerified')
    } else if (code === 'ACCOUNT_LOCKED') {
      errorMsg.value = t('auth.accountLocked', { seconds: retryAfterSeconds(e) ?? 60 })
    } else if (code === 'RATE_LIMITED') {
      errorMsg.value = t('auth.rateLimited', { seconds: retryAfterSeconds(e) ?? 60 })
    } else if (code === 'INVALID_CREDENTIALS') {
      errorMsg.value = t('auth.invalidCredentials')
    } else {
      errorMsg.value = apiErrorMessage(e, t)
    }
  } finally {
    loading.value = false
  }
}

async function submitMfa() {
  if (!mfaToken.value) return
  loading.value = true
  errorMsg.value = ''
  try {
    await auth.verifyMfa(mfaToken.value, mfaCode.value)
    await navigateTo(redirectTarget.value)
  } catch (e) {
    const code = errorCode(e)
    if (code === 'INVALID_MFA_TOKEN') {
      // El token del segundo paso caduca a los 5 minutos: volver al primero.
      mfaToken.value = null
      mfaCode.value = ''
      errorMsg.value = t('auth.mfaExpired')
    } else if (code === 'INVALID_MFA_CODE') {
      errorMsg.value = t('auth.mfaInvalidCode')
    } else if (code === 'ACCOUNT_LOCKED') {
      errorMsg.value = t('auth.accountLocked', { seconds: retryAfterSeconds(e) ?? 60 })
    } else {
      errorMsg.value = apiErrorMessage(e, t)
    }
  } finally {
    loading.value = false
  }
}

async function resendVerification() {
  resending.value = true
  try {
    const { $api } = useNuxtApp()
    await $api('/auth/resend-verification', { method: 'POST', body: { email: form.email } })
    infoMsg.value = t('auth.verificationResent')
    errorMsg.value = ''
    unverified.value = false
  } catch (e) {
    errorMsg.value = apiErrorMessage(e, t)
  } finally {
    resending.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-8 lg:hidden">
      <UiLogo />
    </div>

    <template v-if="!mfaToken">
      <h1 class="text-2xl font-semibold tracking-tight text-fg">{{ $t('auth.signInTitle') }}</h1>
      <p class="mt-1.5 text-sm text-muted">{{ $t('auth.signInSubtitle') }}</p>

      <form class="mt-8 space-y-4" @submit.prevent="submit">
        <UiAlert v-if="infoMsg" variant="info">{{ infoMsg }}</UiAlert>
        <UiAlert v-if="errorMsg" variant="danger">
          {{ errorMsg }}
          <button
            v-if="unverified"
            type="button"
            class="mt-1 block font-medium text-primary hover:underline"
            :disabled="resending"
            @click="resendVerification"
          >
            {{ resending ? $t('common.loading') : $t('auth.resendVerification') }}
          </button>
        </UiAlert>

        <UiInput
          v-model="form.email"
          type="email"
          :label="$t('common.email')"
          :placeholder="$t('auth.emailPlaceholder')"
          icon="user"
          autocomplete="email"
          required
        />
        <div class="space-y-1.5">
          <UiInput
            v-model="form.password"
            type="password"
            :label="$t('common.password')"
            :placeholder="$t('auth.passwordPlaceholder')"
            icon="lock"
            autocomplete="current-password"
            required
          />
          <div class="text-right">
            <NuxtLink to="/forgot-password" class="text-xs font-medium text-primary hover:underline">
              {{ $t('auth.forgotPassword') }}
            </NuxtLink>
          </div>
        </div>

        <AuthTurnstile
          v-if="needsCaptcha && authConfig.captchaSiteKey"
          ref="turnstile"
          v-model="captchaToken"
          :site-key="authConfig.captchaSiteKey"
        />

        <UiButton type="submit" block size="lg" :loading="loading" :disabled="needsCaptcha && !captchaToken">
          {{ loading ? $t('auth.signingIn') : $t('auth.signIn') }}
        </UiButton>

        <AuthSsoButtons />
      </form>

      <p class="mt-6 text-center text-sm text-muted">
        {{ $t('auth.noAccount') }}
        <NuxtLink to="/register" class="font-medium text-primary hover:underline">
          {{ $t('auth.createOne') }}
        </NuxtLink>
      </p>
    </template>

    <!-- Paso 2: código TOTP -->
    <template v-else>
      <h1 class="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight text-fg">
        <UiIcon name="shield" :size="24" class="text-primary" />
        {{ $t('auth.mfaTitle') }}
      </h1>
      <p class="mt-1.5 text-sm text-muted">{{ $t('auth.mfaSubtitle') }}</p>

      <form class="mt-8 space-y-4" @submit.prevent="submitMfa">
        <UiAlert v-if="errorMsg" variant="danger">{{ errorMsg }}</UiAlert>
        <UiInput
          v-model="mfaCode"
          :label="$t('auth.mfaCodeLabel')"
          :hint="$t('auth.mfaCodeHint')"
          placeholder="123456"
          icon="smartphone"
          autocomplete="one-time-code"
          required
        />
        <UiButton type="submit" block size="lg" :loading="loading">
          {{ $t('auth.mfaVerify') }}
        </UiButton>
        <UiButton type="button" variant="ghost" block @click="mfaToken = null; mfaCode = ''; errorMsg = ''">
          {{ $t('common.back') }}
        </UiButton>
      </form>
    </template>
  </div>
</template>
