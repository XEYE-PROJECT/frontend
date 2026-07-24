<script setup lang="ts">
const { theme, toggle } = useTheme()
</script>

<template>
  <UiButton
    variant="ghost"
    size="icon"
    :aria-label="theme === 'dark' ? $t('theme.toLight') : $t('theme.toDark')"
    :title="theme === 'dark' ? $t('theme.toLight') : $t('theme.toDark')"
    @click="toggle"
  >
    <UiIcon :name="theme === 'dark' ? 'sun' : 'moon'" :size="18" />
  </UiButton>
</template>
