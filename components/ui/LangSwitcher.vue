<script setup lang="ts">
import type { Locale } from '~/locales'

const { locale, setLocale, locales } = useI18n()

function choose(code: Locale, close: () => void) {
  setLocale(code)
  close()
}
</script>

<template>
  <UiDropdown align="right">
    <template #trigger>
      <UiButton
        variant="ghost"
        size="icon"
        :aria-label="$t('lang.label')"
        :title="$t('lang.label')"
      >
        <UiIcon name="languages" :size="18" />
      </UiButton>
    </template>

    <template #default="{ close }">
      <UiDropdownItem
        v-for="l in locales"
        :key="l.code"
        icon="globe"
        @click="choose(l.code, close)"
      >
        <span class="flex-1">{{ l.label }}</span>
        <UiIcon v-if="l.code === locale" name="check" :size="16" class="text-primary" />
      </UiDropdownItem>
    </template>
  </UiDropdown>
</template>
