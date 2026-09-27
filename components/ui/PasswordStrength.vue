<script setup lang="ts">
// Barra de fortaleza orientativa (la política real la aplica el backend).
const props = defineProps<{ password: string; email?: string }>()
const { t } = useI18n()

const strength = computed(() => passwordStrength(props.password, props.email))
const labels = ['tooShort', 'weak', 'fair', 'good', 'strong'] as const
const colors = ['bg-line', 'bg-danger', 'bg-warning', 'bg-primary', 'bg-success']
const label = computed(() => {
  if (!props.password) return ''
  if (strength.value.bytes > 72) return t('auth.strength.tooLong')
  return t(`auth.strength.${labels[strength.value.level]}`)
})
</script>

<template>
  <div v-if="password" class="space-y-1" aria-live="polite">
    <div class="grid grid-cols-4 gap-1">
      <span
        v-for="i in 4"
        :key="i"
        class="h-1 rounded-full transition-colors"
        :class="i <= strength.level ? colors[strength.level] : 'bg-line'"
      />
    </div>
    <p class="text-xs" :class="strength.level <= 1 ? 'text-danger' : 'text-subtle'">{{ label }}</p>
  </div>
</template>
