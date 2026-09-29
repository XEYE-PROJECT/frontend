<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { t } = useI18n()
const { $api } = useNuxtApp()

const email = ref('')
const loading = ref(false)
const sent = ref(false)
const errorMsg = ref('')

useHead({ title: () => `${t('auth.forgotTitle')} · XEYE` })

async function submit() {
  loading.value = true
  errorMsg.value = ''
  try {
    await $api('/auth/forgot-password', { method: 'POST', body: { email: email.value } })
    sent.value = true
  } catch (e) {
    errorMsg.value =
      errorCode(e) === 'RATE_LIMITED'
        ? t('auth.rateLimited', { seconds: retryAfterSeconds(e) ?? 60 })
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
    <h1 class="text-2xl font-semibold tracking-tight text-fg">{{ $t('auth.forgotTitle') }}</h1>
    <p class="mt-1.5 text-sm text-muted">{{ $t('auth.forgotSubtitle') }}</p>

    <UiAlert v-if="sent" class="mt-8" variant="success">{{ $t('auth.forgotSent') }}</UiAlert>

    <form v-else class="mt-8 space-y-4" @submit.prevent="submit">
      <UiAlert v-if="errorMsg" variant="danger">{{ errorMsg }}</UiAlert>
      <UiInput
        v-model="email"
        type="email"
        :label="$t('common.email')"
        :placeholder="$t('auth.emailPlaceholder')"
        icon="user"
        autocomplete="email"
        required
      />
      <UiButton type="submit" block size="lg" :loading="loading">{{
        $t('auth.forgotCta')
      }}</UiButton>
    </form>

    <p class="mt-6 text-center text-sm text-muted">
      <NuxtLink to="/login" class="font-medium text-primary hover:underline">{{
        $t('auth.backToLogin')
      }}</NuxtLink>
    </p>
  </div>
</template>
