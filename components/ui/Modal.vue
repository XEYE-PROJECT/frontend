<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    size?: 'sm' | 'md' | 'lg'
    closable?: boolean
  }>(),
  { size: 'md', closable: true },
)

const open = defineModel<boolean>({ default: false })

const maxWidth: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

function close() {
  if (props.closable) open.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

watch(open, (isOpen) => {
  if (!import.meta.client) return
  if (isOpen) {
    document.addEventListener('keydown', onKeydown)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', onKeydown)
    document.body.style.overflow = ''
  }
})

onBeforeUnmount(() => {
  if (!import.meta.client) return
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-6"
      >
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="close" />

        <div
          role="dialog"
          aria-modal="true"
          class="animate-pop-in relative z-10 w-full overflow-hidden rounded-2xl border border-line bg-surface shadow-pop"
          :class="maxWidth[size]"
        >
          <header
            v-if="title || $slots.header"
            class="flex items-start justify-between gap-4 border-b border-line px-5 py-4"
          >
            <div class="min-w-0">
              <slot name="header">
                <h2 class="text-base font-semibold text-fg">{{ title }}</h2>
                <p v-if="description" class="mt-1 text-sm text-muted">{{ description }}</p>
              </slot>
            </div>
            <UiButton
              v-if="closable"
              variant="ghost"
              size="icon-sm"
              icon="x"
              :aria-label="$t('common.close')"
              @click="close"
            />
          </header>

          <div class="px-5 py-4">
            <slot />
          </div>

          <footer
            v-if="$slots.footer"
            class="flex items-center justify-end gap-2 border-t border-line px-5 py-4"
          >
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
