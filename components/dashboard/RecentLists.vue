<script setup lang="ts">
import type { ItemList } from '~/types/api'

defineProps<{
  lists: ItemList[]
  pending: boolean
}>()

const { locale } = useI18n()
</script>

<template>
  <section>
    <header class="mb-3 flex items-center justify-between gap-3">
      <h2 class="text-sm font-semibold text-fg">{{ $t('dashboard.recentLists') }}</h2>
      <NuxtLink
        to="/lists"
        class="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-fg"
      >
        {{ $t('dashboard.viewAll') }}
        <UiIcon name="arrow-right" :size="15" />
      </NuxtLink>
    </header>

    <!-- Filas skeleton de carga -->
    <div v-if="pending" class="space-y-2">
      <UiCard v-for="i in 4" :key="i" :padded="false">
        <div class="flex items-center justify-between gap-3 p-4">
          <div class="flex min-w-0 items-center gap-3">
            <UiSkeleton class="h-9 w-9" rounded="rounded-xl" />
            <div class="space-y-2">
              <UiSkeleton class="h-4 w-40" />
              <UiSkeleton class="h-3 w-24" />
            </div>
          </div>
          <UiSkeleton class="h-5 w-16" rounded="rounded-full" />
        </div>
      </UiCard>
    </div>

    <!-- Estado vacío -->
    <UiEmptyState
      v-else-if="!lists.length"
      icon="list"
      :title="$t('lists.emptyTitle')"
      :description="$t('dashboard.emptyLists')"
      compact
    >
      <UiButton to="/lists" icon="plus">{{ $t('lists.emptyCta') }}</UiButton>
    </UiEmptyState>

    <!-- Filas de listas -->
    <div v-else class="space-y-2">
      <NuxtLink
        v-for="list in lists"
        :key="list.id"
        :to="`/lists/${list.id}`"
        class="group block"
      >
        <UiCard :padded="false" hover>
          <div class="flex items-center justify-between gap-3 p-4">
            <div class="flex min-w-0 items-center gap-3">
              <div
                class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"
              >
                <UiIcon name="list" :size="18" />
              </div>
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-fg">{{ list.name }}</p>
                <p class="truncate text-xs text-muted">
                  {{ $t('common.updatedAt', { date: formatRelative(list.updatedAt, locale) }) }}
                </p>
              </div>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <UiBadge
                :variant="list.public ? 'success' : 'neutral'"
                :icon="list.public ? 'globe' : 'lock'"
              >
                {{ list.public ? $t('lists.public') : $t('lists.private') }}
              </UiBadge>
              <UiIcon
                name="chevron-right"
                :size="16"
                class="text-subtle transition-colors group-hover:text-fg"
              />
            </div>
          </div>
        </UiCard>
      </NuxtLink>
    </div>
  </section>
</template>
