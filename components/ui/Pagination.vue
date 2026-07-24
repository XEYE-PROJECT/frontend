<script setup lang="ts">
// Paginación en cliente: rango + anterior/siguiente + números con elipsis.
// No renderiza nada si todo cabe en una página.
const props = withDefaults(
  defineProps<{
    /** Total de elementos paginados. */
    total: number
    pageSize?: number
  }>(),
  { pageSize: 25 },
)

const page = defineModel<number>({ default: 1 })

const { t } = useI18n()

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const from = computed(() => (page.value - 1) * props.pageSize + 1)
const to = computed(() => Math.min(page.value * props.pageSize, props.total))

/** Páginas a renderizar: primera, última y actual±1, con '…' en los huecos. */
const items = computed<(number | '…')[]>(() => {
  const count = pageCount.value
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1)

  const wanted = [...new Set([1, page.value - 1, page.value, page.value + 1, count])]
    .filter((p) => p >= 1 && p <= count)
    .sort((a, b) => a - b)

  const result: (number | '…')[] = []
  let prev = 0
  for (const p of wanted) {
    if (p - prev === 2) result.push(prev + 1)
    else if (p - prev > 2) result.push('…')
    result.push(p)
    prev = p
  }
  return result
})

function goTo(target: number) {
  page.value = Math.min(Math.max(target, 1), pageCount.value)
}
</script>

<template>
  <nav
    v-if="pageCount > 1"
    class="flex flex-col items-center justify-between gap-3 sm:flex-row"
    :aria-label="t('pagination.label')"
  >
    <p class="text-sm text-muted">
      {{ $t('pagination.range', { from, to, total }) }}
    </p>
    <div class="flex items-center gap-1">
      <UiButton
        variant="ghost"
        size="icon-sm"
        icon="chevron-left"
        :disabled="page <= 1"
        :aria-label="t('pagination.prev')"
        @click="goTo(page - 1)"
      />
      <template v-for="(item, i) in items" :key="i">
        <span v-if="item === '…'" class="px-1 text-sm text-muted">…</span>
        <UiButton
          v-else
          :variant="item === page ? 'subtle' : 'ghost'"
          size="icon-sm"
          :aria-label="t('pagination.page', { page: item })"
          :aria-current="item === page ? 'page' : undefined"
          @click="goTo(item)"
        >
          {{ item }}
        </UiButton>
      </template>
      <UiButton
        variant="ghost"
        size="icon-sm"
        icon="chevron-right"
        :disabled="page >= pageCount"
        :aria-label="t('pagination.next')"
        @click="goTo(page + 1)"
      />
    </div>
  </nav>
</template>
