<script setup lang="ts">
import type { SearchResultItem } from '~/types/api'

const props = defineProps<{
  result: SearchResultItem
}>()

const hasBreakdown = computed(
  () => props.result.text_score != null || props.result.semantic_score != null,
)

const paramsPretty = computed(() =>
  props.result.params != null ? prettyParams(props.result.params) : '',
)
</script>

<template>
  <UiCard>
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0 flex-1">
        <p class="font-medium break-words text-fg">{{ result.item }}</p>
        <div
          v-if="hasBreakdown"
          class="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted"
        >
          <span v-if="result.text_score != null">
            {{ $t('search.textScore') }} · {{ Math.round(result.text_score * 100) }}%
          </span>
          <span v-if="result.semantic_score != null">
            {{ $t('search.semanticScore') }} · {{ Math.round(result.semantic_score * 100) }}%
          </span>
        </div>
      </div>
      <SearchScoreMeter :score="result.score" :label="$t('search.score')" class="w-32 shrink-0" />
    </div>

    <div v-if="paramsPretty" class="mt-3">
      <p class="text-xs font-medium text-subtle">{{ $t('search.params') }}</p>
      <pre
        class="font-mono text-xs bg-surface-2 rounded-lg p-2 mt-2 overflow-x-auto max-h-40"
      >{{ paramsPretty }}</pre>
    </div>
  </UiCard>
</template>
