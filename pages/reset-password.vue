<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { t } = useI18n()
const route = useRoute()
const { $api } = useNuxtApp()

const token = computed(() => (route.query.token as string | undefined) ?? '')
const password = ref('')
const confirm = ref('')
const loading = ref(false)
const errorMsg = ref('')

useHead({ title: () => `${t('auth.resetTitle')} · XEYE` })

const strength = computed(() => passwordStrength(password.value))
const problem = computed(() => {
  if (!password.value) return undefined
  if (password.value.length < 8) return t('auth.passwordMin')
  if (strength.value.bytes > 72) return t('auth.strength.tooLong')
  return undefined
})
const mismatch = computed(() => confirm.value.length > 0 && confirm.value !== password.value)

async function submit() {
  if (problem.value || mismatch.value) return
  loading.value = true
  errorMsg.value = ''
  try {
    await $api('/auth/reset-password', { method: 'POST', body: { token: token.value, password: password.value } })
    await navigateTo({ path: '/login', query: { reason: 'password-reset' } })
  } catch (e) {
    const code = errorCode(e)
    errorMsg.value = code === 'INVALID_TOKEN'
      ? t('auth.resetInvalid')
      : code === 'BREACHED_PASSWORD'
        ? t('auth.passwordBreached')
        : apiErrorMessage(e, t)
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
    <h1 class="text-2xl font-semibold tracking-tight text-fg">{{ $t('auth.resetTitle') }}</h1>
    <p class="mt-1.5 text-sm text-muted">{{ $t('auth.resetSubtitle') }}</p>

    <UiAlert v-if="!token" class="mt-8" variant="danger">{{ $t('auth.resetInvalid') }}</UiAlert>

    <form v-else class="mt-8 space-y-4" @submit.prevent="submit">
      <UiAlert v-if="errorMsg" variant="danger">{{ errorMsg }}</UiAlert>
      <div class="space-y-2">
        <UiInput
          v-model="password"
          type="password"
          :label="$t('auth.newPassword')"
          icon="lock"
          autocomplete="new-password"
          :hint="$t('auth.passwordHint')"
          :error="problem"
          required
        />
        <UiPasswordStrength :password="password" />
      </div>
      <UiInput
        v-model="confirm"
        type="password"
        :label="$t('auth.confirmPassword')"
        icon="lock"
        autocomplete="new-password"
        :error="mismatch ? $t('auth.passwordMismatch') : undefined"
        required
      />
      <UiButton type="submit" block size="lg" :loading="loading" :disabled="!!problem || mismatch || !confirm">
        {{ $t('auth.resetCta') }}
      </UiButton>
    </form>

    <p class="mt-6 text-center text-sm text-muted">
      <NuxtLink to="/login" class="font-medium text-primary hover:underline">{{ $t('auth.backToLogin') }}</NuxtLink>
    </p>
  </div>
</template>
