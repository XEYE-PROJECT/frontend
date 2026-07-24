<script setup lang="ts">
import type { UpdateUserPayload } from '~/types/api'

const auth = useAuthStore()
const { t, locale } = useI18n()
const toast = useToast()

useHead({ title: () => `${t('account.title')} · XEYE` })

// Perfil
const form = reactive({ name: '', surname: '', email: '' })
const profileErrors = ref<Record<string, string>>({})
const savingProfile = ref(false)

watch(
  () => auth.user,
  (u) => {
    form.name = u?.name ?? ''
    form.surname = u?.surname ?? ''
    form.email = u?.email ?? ''
  },
  { immediate: true },
)

async function saveProfile() {
  savingProfile.value = true
  profileErrors.value = {}
  try {
    await auth.updateProfile({ name: form.name, surname: form.surname, email: form.email })
    toast.success(t('account.saved'))
  } catch (e) {
    profileErrors.value = fieldErrors(e)
    toast.error(apiErrorMessage(e, t))
  } finally {
    savingProfile.value = false
  }
}

// Seguridad
const newPassword = ref('')
const savingPassword = ref(false)
const canSavePassword = computed(() => newPassword.value.length >= 8)

async function savePassword() {
  if (!canSavePassword.value) return
  savingPassword.value = true
  try {
    await auth.updateProfile({ password: newPassword.value } satisfies UpdateUserPayload)
    toast.success(t('account.saved'))
    newPassword.value = ''
  } catch (e) {
    toast.error(apiErrorMessage(e, t))
  } finally {
    savingPassword.value = false
  }
}

// Metadatos
const isAdmin = computed(() => auth.user?.permission === 'admin')
const roleLabel = computed(() => t(isAdmin.value ? 'account.roleAdmin' : 'account.roleUser'))
const memberSince = computed(() =>
  auth.user ? t('account.memberSince', { date: formatDate(auth.user.createdAt, locale.value) }) : '',
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

          <UiInput
            v-model="form.email"
            type="email"
            :label="$t('account.fieldEmail')"
            :error="profileErrors.email"
            icon="user"
            autocomplete="email"
          />

          <div class="flex justify-end">
            <UiButton type="submit" :loading="savingProfile">{{ $t('common.save') }}</UiButton>
          </div>
        </form>
      </UiCard>

      <!-- Seguridad -->
      <UiCard>
        <h2 class="text-base font-semibold text-fg">{{ $t('account.securityTitle') }}</h2>

        <form class="mt-4 space-y-4" @submit.prevent="savePassword">
          <UiInput
            v-model="newPassword"
            type="password"
            :label="$t('account.fieldNewPassword')"
            :hint="$t('account.fieldNewPasswordHint')"
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

      <!-- Fila de metadatos -->
      <div class="flex flex-wrap items-center gap-x-3 gap-y-2 px-1 text-sm text-muted">
        <span class="inline-flex items-center gap-2">
          {{ $t('account.roleLabel') }}
          <UiBadge :variant="isAdmin ? 'primary' : 'neutral'" dot>{{ roleLabel }}</UiBadge>
        </span>
        <span aria-hidden="true" class="text-subtle">·</span>
        <span>{{ memberSince }}</span>
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
