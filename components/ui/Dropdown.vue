<script setup lang="ts">
withDefaults(defineProps<{ align?: 'left' | 'right' }>(), { align: 'left' })

const open = ref(false)
const root = ref<HTMLElement | null>(null)

function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}

watch(open, (isOpen) => {
  if (!import.meta.client) return
  if (isOpen) {
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
  } else {
    document.removeEventListener('click', onDocClick)
    document.removeEventListener('keydown', onKey)
  }
})

onBeforeUnmount(() => {
  if (!import.meta.client) return
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="root" class="relative inline-flex">
    <div @click.stop="open = !open">
      <slot name="trigger" :open="open" />
    </div>

    <Transition name="pop">
      <div
        v-if="open"
        class="absolute top-full z-40 mt-2 min-w-[12rem] rounded-xl border border-line bg-surface p-1 shadow-pop"
        :class="align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'"
        @click.stop
      >
        <slot :close="() => (open = false)" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.pop-enter-active,
.pop-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(-4px);
}
</style>
