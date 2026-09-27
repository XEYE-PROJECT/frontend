<script setup lang="ts">
const auth = useAuthStore()
const { t, locale } = useI18n()
const toast = useToast()
const { $api } = useNuxtApp()

useHead({ title: () => `${t('account.title')} · XEYE` })

const isSso = computed(() => !!auth.user?.ssoProvider)

// Perfil (nombre, apellidos, idioma de los emails)
const form = reactive({ name: '', surname: '', locale: 'es' })
const profileErrors = ref<Record<string, string>>({})
const savingProfile = ref(false)

watch(
  () => auth.user,
  (u) => {
    form.name = u?.name ?? ''
    form.surname = u?.surname ?? ''
    form.locale = u?.locale ?? 'es'
  },
  { immediate: true },
)

async function saveProfile() {
  savingProfile.value = true
  profileErrors.value = {}
  try {
    await auth.updateProfile({ name: form.name, surname: form.surname, locale: form.locale })
    toast.success(t('account.saved'))
  } catch (e) {
    profileErrors.value = fieldErrors(e)
    toast.error(apiErrorMessage(e, t))
  } finally {
    savingProfile.value = false
  }
}

// Email: exige la contraseña actual; el cambio se confirma desde el nuevo buzón.
const emailForm = reactive({ email: '', currentPassword: '' })
const savingEmail = ref(false)
const emailSent = ref(false)
const emailError = ref('')

async function requestEmailChange() {
  savingEmail.value = true
  emailError.value = ''
  try {
    await $api('/users/me/email', { method: 'PUT', body: { ...emailForm } })
    emailSent.value = true
    emailForm.currentPassword = ''
  } catch (e) {
    emailError.value = errorCode(e) === 'INVALID_CURRENT_PASSWORD' ? t('account.wrongPassword') : apiErrorMessage(e, t)
  } finally {
    savingEmail.value = false
  }
}

// Contraseña: exige la actual; el backend cierra las demás sesiones y renueva esta.
const pwForm = reactive({ currentPassword: '', newPassword: '', confirm: '' })
const savingPassword = ref(false)
const pwError = ref('')
const pwStrength = computed(() => passwordStrength(pwForm.newPassword, auth.user?.email))
const pwProblem = computed(() => {
  if (!pwForm.newPassword) return undefined
  if (pwForm.newPassword.length < 8) return t('auth.passwordMin')
  if (pwStrength.value.bytes > 72) return t('auth.strength.tooLong')
  return undefined
})
const pwMismatch = computed(() => pwForm.confirm.length > 0 && pwForm.confirm !== pwForm.newPassword)
const canSavePassword = computed(
  () => !!pwForm.currentPassword && !!pwForm.newPassword && !pwProblem.value && pwForm.confirm === pwForm.newPassword,
)

async function savePassword() {
  if (!canSavePassword.value) return
  savingPassword.value = true
  pwError.value = ''
  try {
    await auth.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
    toast.success(t('account.passwordChanged'))
    pwForm.currentPassword = ''
    pwForm.newPassword = ''
    pwForm.confirm = ''
  } catch (e) {
    const code = errorCode(e)
    pwError.value = code === 'INVALID_CURRENT_PASSWORD'
      ? t('account.wrongPassword')
      : code === 'BREACHED_PASSWORD'
        ? t('auth.passwordBreached')
        : apiErrorMessage(e, t)
  } finally {
    savingPassword.value = false
  }
}

// Sesiones
const confirmLogoutAll = ref(false)
const loggingOutAll = ref(false)

async function logoutAll() {
  loggingOutAll.value = true
  try {
    await auth.logoutAll()
  } catch (e) {
    toast.error(apiErrorMessage(e, t))
    loggingOutAll.value = false
  }
}

// Metadatos
const isAdmin = computed(() => auth.user?.permission === 'admin')
const roleLabel = computed(() => t(isAdmin.value ? 'account.roleAdmin' : 'account.roleUser'))
const memberSince = computed(() =>
  auth.user ? t('account.memberSince', { date: formatDate(auth.user.createdAt, locale.value) }) : '',
)
const lastLogin = computed(() =>
  auth.user?.lastLoginAt ? t('account.lastLogin', { date: formatDate(auth.user.lastLoginAt, locale.value) }) : '',
)

// Zona de peligro
const confirmDelete = ref(false)
const deleting = ref(false)

async function onDelete() {
  deleting.value = true
  try {
    await auth.deleteAccount()
    await navigateTo('/login')
  } catch (e) {
    toast.error(apiErrorMessage(e, t))
    deleting.value = false
  }
}

const localeOptions = computed(() => [
  { value: 'es', label: t('lang.es') },
  { value: 'en', label: t('lang.en') },
])
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <AppPageHeader :title="$t('account.title')" :subtitle="$t('account.subtitle')" />

    <div class="flex flex-col gap-6">
      <!-- Perfil -->
      <UiCard>
        <h2 class="text-base font-semibold text-fg">{{ $t('account.profileTitle') }}</h2>

        <form class="mt-4 space-y-4" @submit.prevent="saveProfile">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UiInput
              v-model="form.name"
              :label="$t('account.fieldName')"
              :error="profileErrors.name"
              autocomplete="given-name"
            />
            <UiInput
              v-model="form.surname"
              :label="$t('account.fieldSurname')"
              :error="profileErrors.surname"
              autocomplete="family-name"
            />
          </div>
          <UiSelect v-model="form.locale" :label="$t('account.fieldLocale')" :options="localeOptions" :hint="$t('account.fieldLocaleHint')" />

          <div class="flex justify-end">
            <UiButton type="submit" :loading="savingProfile">{{ $t('common.save') }}</UiButton>
          </div>
        </form>
      </UiCard>

      <!-- Email -->
      <UiCard>
        <h2 class="text-base font-semibold text-fg">{{ $t('account.emailTitle') }}</h2>
        <p class="mt-1 text-sm text-muted">
          {{ $t('account.emailCurrent', { email: auth.user?.email ?? '' }) }}
          <UiBadge v-if="auth.user?.emailVerified" variant="success" dot class="ml-1">{{ $t('account.verified') }}</UiBadge>
        </p>

        <UiAlert v-if="isSso" class="mt-4" variant="info">
          {{ $t('account.ssoManaged', { provider: auth.user?.ssoProvider ?? '' }) }}
        </UiAlert>

        <UiAlert v-if="emailSent" class="mt-4" variant="success">{{ $t('account.emailChangeSent', { email: emailForm.email }) }}</UiAlert>

        <form v-else class="mt-4 space-y-4" @submit.prevent="requestEmailChange">
          <UiAlert v-if="emailError" variant="danger">{{ emailError }}</UiAlert>
          <UiInput
            v-model="emailForm.email"
            type="email"
            :label="$t('account.fieldNewEmail')"
            icon="mail"
            autocomplete="email"
            required
          />
          <UiInput
            v-model="emailForm.currentPassword"
            type="password"
            :label="$t('account.fieldCurrentPassword')"
            :hint="isSso ? $t('account.ssoPasswordHint') : $t('account.reauthHint')"
            icon="lock"
            autocomplete="current-password"
            required
          />
          <div class="flex justify-end">
            <UiButton type="submit" :loading="savingEmail" :disabled="!emailForm.email || !emailForm.currentPassword">
              {{ $t('account.emailChangeCta') }}
            </UiButton>
          </div>
        </form>
      </UiCard>

      <!-- Contraseña -->
      <UiCard>
        <h2 class="text-base font-semibold text-fg">{{ $t('account.securityTitle') }}</h2>
        <p class="mt-1 text-sm text-muted">{{ $t('account.passwordDesc') }}</p>

        <form class="mt-4 space-y-4" @submit.prevent="savePassword">
          <UiAlert v-if="pwError" variant="danger">{{ pwError }}</UiAlert>
          <UiInput
            v-model="pwForm.currentPassword"
            type="password"
            :label="$t('account.fieldCurrentPassword')"
            :hint="isSso ? $t('account.ssoPasswordHint') : undefined"
            icon="lock"
            autocomplete="current-password"
          />
          <div class="space-y-2">
            <UiInput
              v-model="pwForm.newPassword"
              type="password"
              :label="$t('account.fieldNewPassword')"
              :hint="$t('auth.passwordHint')"
              :error="pwProblem"
              icon="lock"
              autocomplete="new-password"
            />
            <UiPasswordStrength :password="pwForm.newPassword" :email="auth.user?.email" />
          </div>
          <UiInput
            v-model="pwForm.confirm"
            type="password"
            :label="$t('auth.confirmPassword')"
            :error="pwMismatch ? $t('auth.passwordMismatch') : undefined"
            icon="lock"
            autocomplete="new-password"
          />

          <div class="flex justify-end">
            <UiButton type="submit" :disabled="!canSavePassword" :loading="savingPassword">
              {{ $t('common.save') }}
            </UiButton>
          </div>
        </form>
      </UiCard>

      <!-- 2FA -->
      <AccountMfaCard />

      <!-- Sesiones -->
      <UiCard>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="min-w-0">
            <h2 class="text-base font-semibold text-fg">{{ $t('account.sessionsTitle') }}</h2>
            <p class="mt-1 text-sm text-muted">{{ $t('account.sessionsDesc') }}</p>
          </div>
          <UiButton variant="outline" icon="logout" class="shrink-0" @click="confirmLogoutAll = true">
            {{ $t('account.sessionsCta') }}
          </UiButton>
        </div>
      </UiCard>

      <!-- Fila de metadatos -->
      <div class="flex flex-wrap items-center gap-x-3 gap-y-2 px-1 text-sm text-muted">
        <span class="inline-flex items-center gap-2">
          {{ $t('account.roleLabel') }}
          <UiBadge :variant="isAdmin ? 'primary' : 'neutral'" dot>{{ roleLabel }}</UiBadge>
        </span>
        <span aria-hidden="true" class="text-subtle">·</span>
        <span>{{ memberSince }}</span>
        <template v-if="lastLogin">
          <span aria-hidden="true" class="text-subtle">·</span>
          <span>{{ lastLogin }}</span>
        </template>
      </div>

      <!-- Zona de peligro -->
      <UiCard>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="min-w-0">
            <h2 class="text-base font-semibold text-danger">{{ $t('account.dangerTitle') }}</h2>
            <p class="mt-1 text-sm text-muted">{{ $t('account.dangerDesc') }}</p>
          </div>
          <UiButton variant="danger" icon="trash" class="shrink-0" @click="confirmDelete = true">
            {{ $t('account.dangerCta') }}
          </UiButton>
        </div>
      </UiCard>
    </div>

    <UiConfirmDialog
      v-model="confirmLogoutAll"
      :title="$t('account.sessionsCta')"
      :message="$t('account.sessionsConfirm')"
      :confirm-label="$t('account.sessionsCta')"
      variant="primary"
      icon="logout"
      :loading="loggingOutAll"
      @confirm="logoutAll"
    />

    <UiConfirmDialog
      v-model="confirmDelete"
      :title="$t('account.dangerConfirmTitle')"
      :message="$t('account.dangerConfirmDesc')"
      :confirm-label="$t('account.dangerCta')"
      variant="danger"
      :loading="deleting"
      @confirm="onDelete"
    />
  </div>
</template>
