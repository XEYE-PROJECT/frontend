<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { t, locale } = useI18n()
const auth = useAuthStore()
const { config: authConfig, load: loadAuthConfig } = useAuthConfig()

const form = reactive({ name: '', surname: '', email: '', password: '' })
const loading = ref(false)
const errorMsg = ref('')
const captchaToken = ref<string | null>(null)
const turnstile = ref<{ reset: () => void } | null>(null)
/** Tras el registro solo se muestra "revisa tu correo": el backend no abre sesión hasta verificar. */
const submitted = ref(false)

useHead({ title: () => `${t('auth.signUp')} · XEYE` })
await loadAuthConfig()

const strength = computed(() => passwordStrength(form.password, form.email))
const passwordProblem = computed(() => {
  if (!form.password) return undefined
  if (form.password.length < 8) return t('auth.passwordMin')
  if (strength.value.bytes > 72) return t('auth.strength.tooLong')
  return undefined
})
const needsCaptcha = computed(() => authConfig.value.captchaProvider !== 'none' && !!authConfig.value.captchaSiteKey)

async function submit() {
  if (passwordProblem.value) {
    errorMsg.value = passwordProblem.value
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    await auth.register({ ...form, locale: locale.value, captchaToken: captchaToken.value })
    if (!authConfig.value.emailVerificationRequired) {
      await navigateTo({ path: '/login', query: { registered: '1' } })
      return
    }
    submitted.value = true
  } catch (e) {
    turnstile.value?.reset()
    const code = errorCode(e)
    if (code === 'WEAK_PASSWORD' || code === 'BREACHED_PASSWORD') {
      errorMsg.value = code === 'BREACHED_PASSWORD' ? t('auth.passwordBreached') : apiErrorMessage(e, t)
    } else if (code === 'RATE_LIMITED') {
      errorMsg.value = t('auth.rateLimited', { seconds: retryAfterSeconds(e) ?? 60 })
    } else {
      errorMsg.value = apiErrorMessage(e, t)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-8 lg:hidden">
      <UiLogo />
    </div>

    <template v-if="submitted">
      <div class="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
        <UiIcon name="mail" :size="24" />
      </div>
      <h1 class="text-2xl font-semibold tracking-tight text-fg">{{ $t('auth.checkInboxTitle') }}</h1>
      <p class="mt-2 text-sm text-muted">{{ $t('auth.checkInboxDesc', { email: form.email }) }}</p>
      <p class="mt-4 text-xs text-subtle">{{ $t('auth.checkInboxHint') }}</p>
      <UiButton class="mt-8" block variant="secondary" to="/login">{{ $t('auth.signInLink') }}</UiButton>
    </template>

    <template v-else>
      <h1 class="text-2xl font-semibold tracking-tight text-fg">{{ $t('auth.signUpTitle') }}</h1>
      <p class="mt-1.5 text-sm text-muted">{{ $t('auth.signUpSubtitle') }}</p>

      <form class="mt-8 space-y-4" @submit.prevent="submit">
        <UiAlert v-if="errorMsg" variant="danger">{{ errorMsg }}</UiAlert>

        <div class="grid grid-cols-2 gap-3">
          <UiInput v-model="form.name" :label="$t('auth.firstName')" autocomplete="given-name" required />
          <UiInput v-model="form.surname" :label="$t('auth.lastName')" autocomplete="family-name" required />
        </div>

        <UiInput
          v-model="form.email"
          type="email"
          :label="$t('common.email')"
          :placeholder="$t('auth.emailPlaceholder')"
          icon="user"
          autocomplete="email"
          required
        />
        <div class="space-y-2">
          <UiInput
            v-model="form.password"
            type="password"
            :label="$t('common.password')"
            :placeholder="$t('auth.passwordPlaceholder')"
            icon="lock"
            autocomplete="new-password"
            :hint="$t('auth.passwordHint')"
            :error="passwordProblem"
            required
          />
          <UiPasswordStrength :password="form.password" :email="form.email" />
        </div>

        <AuthTurnstile
          v-if="needsCaptcha && authConfig.captchaSiteKey"
          ref="turnstile"
          v-model="captchaToken"
          :site-key="authConfig.captchaSiteKey"
        />

        <UiButton type="submit" block size="lg" :loading="loading" :disabled="needsCaptcha && !captchaToken">
          {{ loading ? $t('auth.signingUp') : $t('auth.signUp') }}
        </UiButton>

        <AuthSsoButtons />
      </form>

      <p class="mt-6 text-center text-sm text-muted">
        {{ $t('auth.haveAccount') }}
        <NuxtLink to="/login" class="font-medium text-primary hover:underline">
          {{ $t('auth.signInLink') }}
        </NuxtLink>
      </p>
    </template>
  </div>
</template>
