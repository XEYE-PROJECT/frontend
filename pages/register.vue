<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { t } = useI18n()
const auth = useAuthStore()

const form = reactive({ name: '', surname: '', email: '', password: '' })
const loading = ref(false)
const errorMsg = ref('')

const passwordTooShort = computed(
  () => form.password.length > 0 && form.password.length < 8,
)

useHead({ title: () => `${t('auth.signUp')} · XEYE` })

async function submit() {
  if (form.password.length < 8) {
    errorMsg.value = t('auth.passwordMin')
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    await auth.register({ ...form })
    await navigateTo('/dashboard')
  } catch (e) {
    errorMsg.value = apiErrorMessage(e, t)
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
      <UiInput
        v-model="form.password"
        type="password"
        :label="$t('common.password')"
        :placeholder="$t('auth.passwordPlaceholder')"
        icon="lock"
        autocomplete="new-password"
        :hint="$t('auth.passwordMin')"
        :error="passwordTooShort ? $t('auth.passwordMin') : undefined"
        required
      />

      <UiButton type="submit" block size="lg" :loading="loading">
        {{ loading ? $t('auth.signingUp') : $t('auth.signUp') }}
      </UiButton>
    </form>

    <p class="mt-6 text-center text-sm text-muted">
      {{ $t('auth.haveAccount') }}
      <NuxtLink to="/login" class="font-medium text-primary hover:underline">
        {{ $t('auth.signInLink') }}
      </NuxtLink>
    </p>
  </div>
</template>
