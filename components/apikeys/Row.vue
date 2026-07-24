<script setup lang="ts">
import type { ApiKey } from '~/types/api'

const props = defineProps<{ apiKey: ApiKey }>()
const emit = defineEmits<{ rename: [key: ApiKey]; delete: [key: ApiKey] }>()

const { locale } = useI18n()
const revealed = ref(false)
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
              <UiDropdownItem icon="edit" @click="emit('rename', props.apiKey); close()">
                {{ $t('common.edit') }}
              </UiDropdownItem>
              <UiDropdownItem icon="search" @click="navigateTo('/search'); close()">
                {{ $t('apiKeys.useInSearch') }}
              </UiDropdownItem>
              <UiDropdownItem icon="trash" danger @click="emit('delete', props.apiKey); close()">
                {{ $t('common.delete') }}
              </UiDropdownItem>
            </template>
          </UiDropdown>
        </div>

        <div class="mt-2 flex items-center gap-2">
          <div class="flex min-w-0 flex-1 items-center rounded-lg bg-surface-2 px-2.5 py-1.5">
            <code class="min-w-0 flex-1 font-mono text-sm break-all text-fg">
              {{ revealed ? apiKey.apiKey : '••••••••••••' }}
            </code>
          </div>
          <UiButton
            variant="ghost"
            size="icon-sm"
            :icon="revealed ? 'eye-off' : 'eye'"
            :aria-label="revealed ? $t('apiKeys.hide') : $t('apiKeys.reveal')"
            @click="revealed = !revealed"
          />
          <UiCopyButton :text="apiKey.apiKey" size="sm" variant="ghost" />
        </div>

        <p class="mt-2 text-xs text-subtle">
          {{ $t('common.createdAt', { date: formatDate(apiKey.createdAt, locale) }) }}
        </p>
      </div>
    </div>
  </UiCard>
</template>
