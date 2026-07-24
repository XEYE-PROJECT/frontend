<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'subtle' | 'danger'
type Size = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    type?: 'button' | 'submit' | 'reset'
    to?: RouteLocationRaw
    disabled?: boolean
    loading?: boolean
    block?: boolean
    icon?: string
    iconRight?: string
  }>(),
  { variant: 'primary', size: 'md', type: 'button' },
)

const NuxtLink = resolveComponent('NuxtLink')
const isLink = computed(() => props.to != null)

const base =
  'relative inline-flex items-center justify-center gap-2 font-medium rounded-lg whitespace-nowrap transition-theme select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:pointer-events-none'

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-primary-fg hover:bg-primary-hover shadow-soft',
  secondary: 'bg-surface-2 text-fg border border-line hover:bg-surface-3',
  outline: 'border border-line-strong text-fg hover:bg-surface-2',
  ghost: 'text-muted hover:bg-surface-2 hover:text-fg',
  subtle: 'bg-primary-soft text-primary hover:opacity-85',
  danger: 'bg-danger text-white hover:opacity-90 shadow-soft',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
  icon: 'h-10 w-10',
  'icon-sm': 'h-8 w-8',
}

const iconSize = computed(() => (props.size === 'lg' ? 18 : 16))
const classes = computed(() => [
  base,
  variants[props.variant],
  sizes[props.size],
  props.block && 'w-full',
])
</script>

<template>
  <component
    :is="isLink ? NuxtLink : 'button'"
    :to="isLink ? to : undefined"
    :type="isLink ? undefined : type"
    :disabled="!isLink ? disabled || loading : undefined"
    :aria-disabled="isLink && (disabled || loading) ? 'true' : undefined"
    :aria-busy="loading || undefined"
    :class="classes"
  >
    <UiSpinner v-if="loading" :size="iconSize" />
    <UiIcon v-else-if="icon" :name="icon" :size="iconSize" />
    <slot />
    <UiIcon v-if="iconRight && !loading" :name="iconRight" :size="iconSize" />
  </component>
</template>
