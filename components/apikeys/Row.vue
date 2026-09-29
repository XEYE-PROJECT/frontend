<script setup lang="ts">
import type { ApiKey } from '~/types/api'

const props = defineProps<{ apiKey: ApiKey }>()
const emit = defineEmits<{ rename: [key: ApiKey]; delete: [key: ApiKey] }>()

const { locale } = useI18n()

/** Emite la acción del menú con la clave y lo cierra (`close` viene del slot del dropdown). */
function pick(action: 'rename' | 'delete', close: () => void) {
  if (action === 'rename') emit('rename', props.apiKey)
  else emit('delete', props.apiKey)
  close()
}
</script>

<template>
  <UiCard>
    <div class="flex items-start gap-3">
      <div
        class="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary sm:flex"
      >
        <UiIcon name="key" :size="16" />
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-center justify-between gap-2">
          <p class="truncate font-medium text-fg">{{ apiKey.name }}</p>

          <UiDropdown align="right">
            <template #trigger>
              <UiButton
                variant="ghost"
                size="icon-sm"
                icon="more-horizontal"
                :aria-label="$t('common.actions')"
              />
            </template>
            <template #default="{ close }">
              <UiDropdownItem icon="edit" @click="pick('rename', close)">
                {{ $t('common.edit') }}
              </UiDropdownItem>
              <UiDropdownItem icon="trash" danger @click="pick('delete', close)">
                {{ $t('common.delete') }}
              </UiDropdownItem>
            </template>
          </UiDropdown>
        </div>

        <!-- Solo el prefijo: el backend guarda el hash y el valor completo no puede recuperarse. -->
        <div class="mt-2 flex items-center rounded-lg bg-surface-2 px-2.5 py-1.5">
          <code class="min-w-0 flex-1 font-mono text-sm text-fg">{{ apiKey.prefix }}…</code>
        </div>
        <p class="mt-1.5 text-xs text-subtle">{{ $t('apiKeys.prefixHint') }}</p>

        <p class="mt-2 text-xs text-subtle">
          {{ $t('common.createdAt', { date: formatDate(apiKey.createdAt, locale) }) }}
        </p>
      </div>
    </div>
  </UiCard>
</template>
