<script setup lang="ts">
import type { AdminUser } from '~/types/api'

// Administración de cuentas (solo admin; el middleware bloquea a los demás y el backend responde 403).
const { t, locale } = useI18n()
const toast = useToast()
const auth = useAuthStore()
const api = useAdminUsersApi()

useHead({ title: () => `${t('admin.title')} · XEYE` })

const PAGE_SIZE = 25
const page = ref(1)
const items = ref<AdminUser[]>([])
const total = ref(0)
const loading = ref(true)
const busyId = ref<number | null>(null)
const query = ref('')

async function load() {
  loading.value = true
  try {
    const res = await api.list((page.value - 1) * PAGE_SIZE, PAGE_SIZE)
    items.value = res.items
    total.value = res.total
  } catch (e) {
    toast.error(apiErrorMessage(e, t))
  } finally {
    loading.value = false
  }
}

watch(page, load)
onMounted(load)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return items.value
  return items.value.filter(
    (u) => u.email.toLowerCase().includes(q) || `${u.name} ${u.surname}`.toLowerCase().includes(q),
  )
})

function isLocked(u: AdminUser) {
  return !!u.lockedUntil && new Date(u.lockedUntil).getTime() > Date.now()
}

async function act(u: AdminUser, fn: () => Promise<unknown>, okMsg: string) {
  busyId.value = u.id
  try {
    await fn()
    toast.success(okMsg)
    await load()
  } catch (e) {
    toast.error(apiErrorMessage(e, t))
  } finally {
    busyId.value = null
  }
}

const toggleRole = (u: AdminUser) =>
  act(u, () => api.update(u.id, { permission: u.permission === 'admin' ? 'user' : 'admin' }), t('admin.roleUpdated'))
const verify = (u: AdminUser) => act(u, () => api.update(u.id, { emailVerified: true }), t('admin.verified'))
const unlock = (u: AdminUser) => act(u, () => api.update(u.id, { unlock: true }), t('admin.unlocked'))
const logoutAll = (u: AdminUser) => act(u, () => api.logoutAll(u.id), t('admin.sessionsClosed'))

// Cupo de búsquedas/min de la cuenta (todas sus claves API lo comparten). Vacío = por defecto.
const limitTarget = ref<AdminUser | null>(null)
const limitValue = ref('')
const limitOpen = computed({
  get: () => limitTarget.value !== null,
  set: (v: boolean) => {
    if (!v) limitTarget.value = null
  },
})
function editLimit(u: AdminUser) {
  limitValue.value = u.searchRateLimitPerMinute ? String(u.searchRateLimitPerMinute) : ''
  limitTarget.value = u
}
const limitNumber = computed(() => Number.parseInt(limitValue.value, 10))
const limitValid = computed(() => Number.isInteger(limitNumber.value) && limitNumber.value >= 1)
async function saveLimit(reset = false) {
  const u = limitTarget.value
  if (!u) return
  limitTarget.value = null
  const payload = reset ? { resetSearchRateLimit: true } : { searchRateLimitPerMinute: limitNumber.value }
  await act(u, () => api.update(u.id, payload), t('admin.limitUpdated'))
}

const confirmTarget = ref<AdminUser | null>(null)
const confirmOpen = computed({
  get: () => confirmTarget.value !== null,
  set: (v: boolean) => {
    if (!v) confirmTarget.value = null
  },
})
async function remove() {
  const u = confirmTarget.value
  if (!u) return
  confirmTarget.value = null
  await act(u, () => api.remove(u.id), t('admin.deleted'))
}
</script>

<template>
  <div>
    <AppPageHeader :title="$t('admin.title')" :subtitle="$t('admin.subtitle', { total })" />

    <UiCard class="mb-4">
      <UiInput v-model="query" icon="search" :placeholder="$t('admin.searchPlaceholder')" />
    </UiCard>

    <UiCard>
      <div v-if="loading" class="flex items-center gap-3 py-8 text-sm text-muted"><UiSpinner /> {{ $t('common.loading') }}</div>
      <UiEmptyState v-else-if="!filtered.length" icon="users" :title="$t('admin.empty')" />
      <div v-else class="-mx-4 overflow-x-auto sm:mx-0">
        <table class="w-full text-sm">
          <thead class="text-left text-xs uppercase tracking-wide text-subtle">
            <tr>
              <th class="px-4 py-2">{{ $t('admin.colUser') }}</th>
              <th class="px-4 py-2">{{ $t('admin.colStatus') }}</th>
              <th class="px-4 py-2">{{ $t('admin.colLastLogin') }}</th>
              <th class="px-4 py-2 text-right">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr v-for="u in filtered" :key="u.id" class="align-top">
              <td class="px-4 py-3">
                <p class="font-medium text-fg">{{ u.name }} {{ u.surname }}
                  <span v-if="u.id === auth.user?.id" class="text-xs text-subtle">({{ $t('admin.you') }})</span>
                </p>
                <p class="text-xs text-muted">{{ u.email }}</p>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">
                  <UiBadge :variant="u.permission === 'admin' ? 'primary' : 'neutral'" dot>
                    {{ u.permission === 'admin' ? $t('account.roleAdmin') : $t('account.roleUser') }}
                  </UiBadge>
                  <UiBadge v-if="!u.emailVerified" variant="warning">{{ $t('admin.unverified') }}</UiBadge>
                  <UiBadge v-if="u.mfaEnabled" variant="success">2FA</UiBadge>
                  <UiBadge v-if="u.ssoProvider" variant="neutral">{{ u.ssoProvider }}</UiBadge>
                  <UiBadge v-if="isLocked(u)" variant="danger">{{ $t('admin.locked') }}</UiBadge>
                  <UiBadge v-if="u.searchRateLimitPerMinute" variant="neutral">
                    {{ $t('admin.limitBadge', { n: u.searchRateLimitPerMinute }) }}
                  </UiBadge>
                </div>
              </td>
              <td class="px-4 py-3 text-muted">{{ u.lastLoginAt ? formatDate(u.lastLoginAt, locale) : '—' }}</td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap justify-end gap-1">
                  <UiButton size="sm" variant="ghost" :disabled="busyId === u.id || u.id === auth.user?.id" @click="toggleRole(u)">
                    {{ u.permission === 'admin' ? $t('admin.makeUser') : $t('admin.makeAdmin') }}
                  </UiButton>
                  <UiButton v-if="!u.emailVerified" size="sm" variant="ghost" icon="check" :disabled="busyId === u.id" @click="verify(u)">
                    {{ $t('admin.verify') }}
                  </UiButton>
                  <UiButton v-if="isLocked(u) || u.failedLoginCount > 0" size="sm" variant="ghost" icon="unlock" :disabled="busyId === u.id" @click="unlock(u)">
                    {{ $t('admin.unlock') }}
                  </UiButton>
                  <UiButton size="sm" variant="ghost" icon="zap" :disabled="busyId === u.id" @click="editLimit(u)">
                    {{ $t('admin.limit') }}
                  </UiButton>
                  <UiButton size="sm" variant="ghost" icon="logout" :disabled="busyId === u.id" @click="logoutAll(u)">
                    {{ $t('admin.logoutAll') }}
                  </UiButton>
                  <UiButton size="sm" variant="ghost" icon="trash" class="text-danger" :disabled="busyId === u.id || u.id === auth.user?.id" @click="confirmTarget = u">
                    {{ $t('common.delete') }}
                  </UiButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <UiPagination v-model="page" :total="total" :page-size="PAGE_SIZE" class="mt-4" />
    </UiCard>

    <UiModal v-model="limitOpen" :title="$t('admin.limitTitle')">
      <p class="mb-4 text-sm text-muted">{{ $t('admin.limitDesc', { email: limitTarget?.email ?? '' }) }}</p>
      <UiInput
        v-model="limitValue"
        type="number"
        min="1"
        :label="$t('admin.limitLabel')"
        :placeholder="$t('admin.limitPlaceholder')"
        :hint="$t('admin.limitHint')"
        @keyup.enter="limitValid && saveLimit()"
      />
      <template #footer>
        <UiButton variant="ghost" @click="saveLimit(true)">{{ $t('admin.limitReset') }}</UiButton>
        <UiButton :disabled="!limitValid" @click="saveLimit()">{{ $t('common.save') }}</UiButton>
      </template>
    </UiModal>

    <UiConfirmDialog
      v-model="confirmOpen"
      :title="$t('admin.deleteTitle')"
      :message="$t('admin.deleteDesc', { email: confirmTarget?.email ?? '' })"
      :confirm-label="$t('common.delete')"
      variant="danger"
      @confirm="remove"
    />
  </div>
</template>
