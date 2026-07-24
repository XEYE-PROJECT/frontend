<script setup lang="ts">
import type { ItemList } from '~/types/api'

defineProps<{ list: ItemList; pendingTraining?: boolean }>()
const emit = defineEmits<{ edit: []; delete: [] }>()

const { locale } = useI18n()

function onEdit(close: () => void) {
  emit('edit')
  close()
}
function onDelete(close: () => void) {
  emit('delete')
  close()
}
</script>

<template>
  <UiCard hover class="h-full">
    <div class="flex h-full flex-col gap-3">
      <div class="flex items-start justify-between gap-2">
        <NuxtLink
          :to="`/lists/${list.id}`"
          class="min-w-0 flex-1 truncate text-base font-semibold text-fg transition-colors hover:text-primary"
        >
          {{ list.name }}
        </NuxtLink>

        <UiDropdown align="right">
          <template #trigger="{ open }">
            <UiButton
              variant="ghost"
              size="icon-sm"
              icon="more-horizontal"
              :aria-label="$t('common.actions')"
              :aria-expanded="open"
            />
          </template>
          <template #default="{ close }">
            <UiDropdownItem icon="edit" @click="onEdit(close)">
              {{ $t('common.edit') }}
            </UiDropdownItem>
            <UiDropdownItem icon="trash" danger @click="onDelete(close)">
              {{ $t('common.delete') }}
            </UiDropdownItem>
          </template>
        </UiDropdown>
      </div>

      <p v-if="list.description" class="line-clamp-2 text-sm text-muted">
        {{ list.description }}
      </p>
      <p v-else class="text-sm text-subtle">{{ $t('common.none') }}</p>

      <div class="mt-auto flex items-center justify-between gap-2 pt-1">
        <div class="flex min-w-0 flex-wrap items-center gap-2">
          <UiBadge
            :variant="list.public ? 'success' : 'neutral'"
            :icon="list.public ? 'globe' : 'lock'"
          >
            {{ list.public ? $t('lists.public') : $t('lists.private') }}
          </UiBadge>
          <UiBadge v-if="pendingTraining" variant="warning" icon="alert-triangle">
            {{ $t('lists.pendingTraining') }}
          </UiBadge>
        </div>
        <span class="text-xs text-subtle">{{ formatRelative(list.updatedAt, locale) }}</span>
      </div>
    </div>
  </UiCard>
</template>
