<script setup lang="ts">
import type { Element } from '~/types/api'

defineProps<{ element: Element }>()
const emit = defineEmits<{ edit: []; delete: [] }>()
</script>

<template>
  <UiCard>
    <div class="flex items-start gap-3">
      <div class="min-w-0 flex-1 space-y-2">
        <div class="flex flex-wrap items-center gap-2">
          <p class="min-w-0 truncate font-medium text-fg">{{ element.text }}</p>
          <UiBadge
            :variant="element.trained ? 'success' : 'neutral'"
            :icon="element.trained ? 'check-circle' : 'clock'"
          >
            {{ element.trained ? $t('elements.trained') : $t('elements.untrained') }}
          </UiBadge>
        </div>

        <p v-if="element.description" class="line-clamp-2 text-sm text-muted">
          {{ element.description }}
        </p>

        <div v-if="element.generatedDescription" class="space-y-0.5">
          <p class="text-xs font-medium text-subtle">{{ $t('elements.generatedLabel') }}</p>
          <p class="line-clamp-2 text-sm text-muted">{{ element.generatedDescription }}</p>
        </div>

        <pre
          v-if="element.params"
          class="max-h-40 overflow-x-auto overflow-y-auto rounded-lg bg-surface-2 p-2 font-mono text-xs text-muted"
        >{{ prettyParams(element.params) }}</pre>
      </div>

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
          <UiDropdownItem icon="edit" @click="emit('edit'); close()">
            {{ $t('common.edit') }}
          </UiDropdownItem>
          <UiDropdownItem icon="trash" danger @click="emit('delete'); close()">
            {{ $t('common.delete') }}
          </UiDropdownItem>
        </template>
      </UiDropdown>
    </div>
  </UiCard>
</template>
