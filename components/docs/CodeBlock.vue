<script setup lang="ts">
defineProps<{
  code: string
  /** Etiqueta de la cabecera (lenguaje, nombre de archivo…). */
  label?: string
}>()
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-line bg-surface-2">
    <div class="flex items-center justify-between gap-2 border-b border-line py-1 pl-3 pr-1.5">
      <span class="font-mono text-xs text-subtle">{{ label }}</span>
      <UiCopyButton :text="code" variant="ghost" size="sm" />
    </div>
    <pre class="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-fg"><code>{{ code }}</code></pre>
  </div>
</template>
