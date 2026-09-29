<script setup lang="ts">
// Destino de los enlaces "verificar email" y "confirmar nuevo email". Consume el token y, si
// no hay 2FA, entra directamente; con 2FA manda al login (el reto exige la contraseña de nuevo).
definePageMeta({ layout: 'auth' })

const { t } = useI18n()
const auth = useAuthStore()
const route = useRoute()

const state = ref<'working' | 'ok' | 'error'>('working')
const errorMsg = ref('')

useHead({ title: () => `${t('auth.verifyTitle')} · XEYE` })

onMounted(async () => {
  const token = route.query.token as string | undefined
  if (!token) {
    state.value = 'error'
    errorMsg.value = t('auth.verifyInvalid')
    return
  }
  try {
    const res = await auth.verifyEmail(token)
    state.value = 'ok'
    if (res.mfaRequired) {
      await navigateTo({ path: '/login', query: { reason: 'email-changed' } })
      return
    }
    window.setTimeout(() => navigateTo('/dashboard'), 1200)
  } catch (e) {
    state.value = 'error'
    errorMsg.value =
      errorCode(e) === 'INVALID_TOKEN' ? t('auth.verifyInvalid') : apiErrorMessage(e, t)
  }
})
</script>

<template>
  <div>
    <div class="mb-8 lg:hidden">
      <UiLogo />
    </div>
    <div v-if="state === 'working'" class="flex items-center gap-3 text-sm text-muted">
      <UiSpinner /> {{ $t('auth.verifyWorking') }}
    </div>
    <template v-else-if="state === 'ok'">
      <div class="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-success-soft text-success">
        <UiIcon name="check-circle" :size="24" />
      </div>
      <h1 class="text-2xl font-semibold tracking-tight text-fg">
        {{ $t('auth.verifyDoneTitle') }}
      </h1>
      <p class="mt-2 text-sm text-muted">{{ $t('auth.verifyDoneDesc') }}</p>
    </template>
    <template v-else>
      <h1 class="text-2xl font-semibold tracking-tight text-fg">{{ $t('auth.verifyTitle') }}</h1>
      <UiAlert class="mt-6" variant="danger">{{ errorMsg }}</UiAlert>
      <p class="mt-4 text-sm text-muted">{{ $t('auth.verifyRetryHint') }}</p>
      <UiButton class="mt-6" block variant="secondary" to="/login">{{
        $t('auth.signInLink')
      }}</UiButton>
    </template>
  </div>
</template>
