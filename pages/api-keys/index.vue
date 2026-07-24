<script setup lang="ts">
import type { ApiKey } from '~/types/api'

const { t } = useI18n()
const toast = useToast()
const keysApi = useApiKeysApi()

useHead({ title: () => `${t('apiKeys.title')} · XEYE` })

const { data: keys, pending, refresh } = useAsyncData('api-keys', () => keysApi.all(), {
  lazy: true,
  default: () => [] as ApiKey[],
})

// Crear
const showCreate = ref(false)

// Renombrar
const showRename = ref(false)
const renaming = ref<ApiKey | null>(null)
const renameName = ref('')
const renameSaving = ref(false)

function onRename(key: ApiKey) {
  renaming.value = key
  renameName.value = key.name
  showRename.value = true
}

async function saveRename() {
  if (!renaming.value) return
  renameSaving.value = true
  try {
    await keysApi.rename(renaming.value.id, renameName.value.trim())
    toast.success(t('apiKeys.updated'))
    await refresh()
    showRename.value = false
  } catch (e) {
    toast.error(apiErrorMessage(e, t))
  } finally {
    renameSaving.value = false
  }
}

// Borrar
const showDelete = ref(false)
const deleting = ref<ApiKey | null>(null)
const deleteLoading = ref(false)

function onDelete(key: ApiKey) {
  deleting.value = key
  showDelete.value = true
}

async function confirmDelete() {
  if (!deleting.value) return
  deleteLoading.value = true
  try {
    await keysApi.remove(deleting.value.id)
    toast.success(t('apiKeys.deleted'))
    await refresh()
    showDelete.value = false
  } catch (e) {
    toast.error(apiErrorMessage(e, t))
  } finally {
    deleteLoading.value = false
  }
}
</script>

<template>
  <div>
    <AppPageHeader :title="$t('apiKeys.title')" :subtitle="$t('apiKeys.subtitle')">
      <template #actions>
        <UiButton icon="plus" @click="showCreate = true">{{ $t('apiKeys.new') }}</UiButton>
      </template>
    </AppPageHeader>

    <div v-if="pending" class="space-y-3">
      <UiCard v-for="i in 3" :key="i">
        <div class="flex items-start gap-3">
          <UiSkeleton class="hidden h-9 w-9 rounded-lg sm:block" />
          <div class="min-w-0 flex-1 space-y-2.5">
            <UiSkeleton class="h-4 w-32" />
            <UiSkeleton class="h-9 w-full max-w-sm" />
            <UiSkeleton class="h-3 w-24" />
          </div>
        </div>
      </UiCard>
    </div>

    <UiEmptyState
      v-else-if="!keys.length"
      icon="key"
      :title="$t('apiKeys.emptyTitle')"
      :description="$t('apiKeys.emptyDesc')"
    >
      <UiButton icon="plus" @click="showCreate = true">{{ $t('apiKeys.emptyCta') }}</UiButton>
    </UiEmptyState>

    <div v-else class="space-y-3">
      <ApikeysRow
        v-for="k in keys"
        :key="k.id"
        :api-key="k"
        @rename="onRename"
        @delete="onDelete"
      />
    </div>

    <ApikeysCreateModal v-model="showCreate" @created="refresh" />

    <UiModal v-model="showRename" :title="$t('apiKeys.renameTitle')">
      <UiInput
        v-model="renameName"
        :label="$t('apiKeys.fieldName')"
        :placeholder="$t('apiKeys.fieldNamePlaceholder')"
        @keyup.enter="saveRename"
      />
      <template #footer>
        <UiButton variant="ghost" :disabled="renameSaving" @click="showRename = false">
          {{ $t('common.cancel') }}
        </UiButton>
        <UiButton :loading="renameSaving" :disabled="!renameName.trim()" @click="saveRename">
          {{ renameSaving ? $t('common.saving') : $t('common.save') }}
        </UiButton>
      </template>
    </UiModal>

    <UiConfirmDialog
      v-model="showDelete"
      :title="$t('apiKeys.deleteTitle')"
      :message="$t('apiKeys.deleteDesc', { name: deleting?.name ?? '' })"
      :confirm-label="$t('common.delete')"
      :loading="deleteLoading"
      @confirm="confirmDelete"
    />
  </div>
</template>
