<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { t } = useI18n()
const auth = useAuthStore()
const route = useRoute()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const errorMsg = ref('')

useHead({ title: () => `${t('auth.signIn')} · XEYE` })

async function submit() {
  loading.value = true
  errorMsg.value = ''
  try {
    await auth.login({ email: form.email, password: form.password })
    const redirect = (route.query.redirect as string) || '/dashboard'
    await navigateTo(redirect)
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

    <h1 class="text-2xl font-semibold tracking-tight text-fg">{{ $t('auth.signInTitle') }}</h1>
    <p class="mt-1.5 text-sm text-muted">{{ $t('auth.signInSubtitle') }}</p>

    <form class="mt-8 space-y-4" @submit.prevent="submit">
      <UiAlert v-if="errorMsg" variant="danger">{{ errorMsg }}</UiAlert>

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
        autocomplete="current-password"
        required
      />

      <UiButton type="submit" block size="lg" :loading="loading">
        {{ loading ? $t('auth.signingIn') : $t('auth.signIn') }}
      </UiButton>
    </form>

    <p class="mt-6 text-center text-sm text-muted">
      {{ $t('auth.noAccount') }}
      <NuxtLink to="/register" class="font-medium text-primary hover:underline">
        {{ $t('auth.createOne') }}
      </NuxtLink>
    </p>
  </div>
</template>
