<script setup lang="ts">
import QRCode from 'qrcode'
import type { MfaSetup } from '~/types/api'

// Segundo factor (TOTP): activar (contraseña → QR → código → códigos de recuperación, una sola
// vez) y desactivar (contraseña + código).
const auth = useAuthStore()
const { t } = useI18n()
const toast = useToast()
const { $api } = useNuxtApp()

const enabled = computed(() => auth.user?.mfaEnabled ?? false)

// Activación
const setupOpen = ref(false)
const step = ref<1 | 2 | 3>(1)
const password = ref('')
const setup = ref<MfaSetup | null>(null)
const qr = ref('')
const code = ref('')
const recoveryCodes = ref<string[]>([])
const acknowledged = ref(false)
const busy = ref(false)
const error = ref('')

function openSetup() {
  step.value = 1
  password.value = ''
  setup.value = null
  qr.value = ''
  code.value = ''
  recoveryCodes.value = []
  acknowledged.value = false
  error.value = ''
  setupOpen.value = true
}

async function startSetup() {
  busy.value = true
  error.value = ''
  try {
    setup.value = await $api<MfaSetup>('/users/me/mfa/setup', {
      method: 'POST',
      body: { currentPassword: password.value },
    })
    qr.value = await QRCode.toDataURL(setup.value.otpauthUri, { margin: 1, width: 200 })
    step.value = 2
  } catch (e) {
    error.value = apiErrorMessage(e, t)
  } finally {
    busy.value = false
  }
}

async function enable() {
  busy.value = true
  error.value = ''
  try {
    const res = await $api<{ recoveryCodes: string[] }>('/users/me/mfa/enable', {
      method: 'POST',
      body: { code: code.value },
    })
    recoveryCodes.value = res.recoveryCodes
    step.value = 3
    // Activar el 2FA invalida las sesiones anteriores: la actual deja de valer al cerrar el modal.
  } catch (e) {
    error.value = apiErrorMessage(e, t)
  } finally {
    busy.value = false
  }
}

async function finishSetup() {
  setupOpen.value = false
  toast.success(t('account.mfa.enabled'))
  // El token actual ya no es válido (versión de sesión): re-login.
  auth.clearSession()
  await navigateTo({ path: '/login', query: { reason: 'mfa' } })
}

// Desactivación
const disableOpen = ref(false)
const disablePassword = ref('')
const disableCode = ref('')

async function disable() {
  busy.value = true
  error.value = ''
  try {
    await $api('/users/me/mfa/disable', {
      method: 'POST',
      body: { currentPassword: disablePassword.value, code: disableCode.value },
    })
    disableOpen.value = false
    disablePassword.value = ''
    disableCode.value = ''
    await auth.fetchMe()
    toast.success(t('account.mfa.disabled'))
  } catch (e) {
    error.value = apiErrorMessage(e, t)
  } finally {
    busy.value = false
  }
}

const recoveryText = computed(() => recoveryCodes.value.join('\n'))
</script>

<template>
  <UiCard>
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0">
        <h2 class="inline-flex items-center gap-2 text-base font-semibold text-fg">
          <UiIcon name="shield" :size="18" class="text-primary" />
          {{ $t('account.mfa.title') }}
          <UiBadge :variant="enabled ? 'success' : 'neutral'" dot>
            {{ enabled ? $t('account.mfa.on') : $t('account.mfa.off') }}
          </UiBadge>
        </h2>
        <p class="mt-1 text-sm text-muted">{{ $t('account.mfa.desc') }}</p>
      </div>
      <UiButton
        v-if="!enabled"
        icon="shield-check"
        class="shrink-0"
        @click="openSetup"
      >
        {{ $t('account.mfa.enable') }}
      </UiButton>
      <UiButton v-else variant="outline" class="shrink-0" @click="disableOpen = true; error = ''">
        {{ $t('account.mfa.disable') }}
      </UiButton>
    </div>

    <!-- Activación -->
    <UiModal v-model="setupOpen" :title="$t('account.mfa.setupTitle')" :closable="step !== 3">
      <div class="space-y-4">
        <UiAlert v-if="error" variant="danger">{{ error }}</UiAlert>

        <template v-if="step === 1">
          <p class="text-sm text-muted">{{ $t('account.mfa.step1') }}</p>
          <UiInput
            v-model="password"
            type="password"
            :label="$t('account.fieldCurrentPassword')"
            icon="lock"
            autocomplete="current-password"
            @keyup.enter="startSetup"
          />
        </template>

        <template v-else-if="step === 2 && setup">
          <p class="text-sm text-muted">{{ $t('account.mfa.step2') }}</p>
          <div class="flex flex-col items-center gap-3">
            <img :src="qr" alt="QR TOTP" width="200" height="200" class="rounded-lg bg-white p-2" />
            <details class="w-full text-xs text-subtle">
              <summary class="cursor-pointer">{{ $t('account.mfa.manualEntry') }}</summary>
              <code class="mt-1 block break-all rounded bg-surface-2 p-2 font-mono text-fg">{{ setup.secret }}</code>
            </details>
          </div>
          <UiInput
            v-model="code"
            :label="$t('account.mfa.codeLabel')"
            placeholder="123456"
            autocomplete="one-time-code"
            @keyup.enter="enable"
          />
        </template>

        <template v-else>
          <UiAlert variant="warning">{{ $t('account.mfa.recoveryWarning') }}</UiAlert>
          <div class="grid grid-cols-2 gap-2 rounded-lg bg-surface-2 p-3 font-mono text-sm text-fg">
            <span v-for="c in recoveryCodes" :key="c">{{ c }}</span>
          </div>
          <div class="flex justify-end">
            <UiCopyButton :text="recoveryText" size="sm" />
          </div>
          <label class="flex cursor-pointer items-start gap-2 text-sm text-fg">
            <input v-model="acknowledged" type="checkbox" class="mt-0.5 accent-primary" />
            <span>{{ $t('account.mfa.recoveryAck') }}</span>
          </label>
          <p class="text-xs text-subtle">{{ $t('account.mfa.relogin') }}</p>
        </template>
      </div>

      <template #footer>
        <template v-if="step === 1">
          <UiButton variant="ghost" @click="setupOpen = false">{{ $t('common.cancel') }}</UiButton>
          <UiButton :loading="busy" :disabled="!password" @click="startSetup">{{ $t('common.confirm') }}</UiButton>
        </template>
        <template v-else-if="step === 2">
          <UiButton variant="ghost" @click="setupOpen = false">{{ $t('common.cancel') }}</UiButton>
          <UiButton :loading="busy" :disabled="code.replace(/\s/g, '').length !== 6" @click="enable">
            {{ $t('account.mfa.activate') }}
          </UiButton>
        </template>
        <template v-else>
          <UiButton :disabled="!acknowledged" @click="finishSetup">{{ $t('common.close') }}</UiButton>
        </template>
      </template>
    </UiModal>

    <!-- Desactivación -->
    <UiModal v-model="disableOpen" :title="$t('account.mfa.disableTitle')" size="sm">
      <div class="space-y-4">
        <UiAlert v-if="error" variant="danger">{{ error }}</UiAlert>
        <p class="text-sm text-muted">{{ $t('account.mfa.disableDesc') }}</p>
        <UiInput
          v-model="disablePassword"
          type="password"
          :label="$t('account.fieldCurrentPassword')"
          icon="lock"
          autocomplete="current-password"
        />
        <UiInput
          v-model="disableCode"
          :label="$t('account.mfa.codeOrRecovery')"
          autocomplete="one-time-code"
          @keyup.enter="disable"
        />
      </div>
      <template #footer>
        <UiButton variant="ghost" @click="disableOpen = false">{{ $t('common.cancel') }}</UiButton>
        <UiButton variant="danger" :loading="busy" :disabled="!disablePassword || !disableCode" @click="disable">
          {{ $t('account.mfa.disable') }}
        </UiButton>
      </template>
    </UiModal>
  </UiCard>
</template>
