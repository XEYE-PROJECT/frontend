<script setup lang="ts">
import type { ToastType } from '~/composables/useToast'

const { toasts, dismiss } = useToast()

const meta: Record<ToastType, { icon: string; cls: string }> = {
  success: { icon: 'check-circle', cls: 'text-success' },
  error: { icon: 'alert-circle', cls: 'text-danger' },
  info: { icon: 'info', cls: 'text-info' },
}
</script>

<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2"
    >
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-surface p-3.5 shadow-pop"
          role="status"
        >
          <UiIcon :name="meta[t.type].icon" :size="18" class="mt-0.5" :class="meta[t.type].cls" />
          <p class="flex-1 text-sm text-fg">{{ t.message }}</p>
          <button
            type="button"
            class="text-subtle transition-colors hover:text-fg"
            :aria-label="$t('common.close')"
            @click="dismiss(t.id)"
          >
            <UiIcon name="x" :size="16" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(1rem) scale(0.96);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(1rem) scale(0.96);
}
.toast-leave-active {
  position: absolute;
  width: 100%;
}
</style>
