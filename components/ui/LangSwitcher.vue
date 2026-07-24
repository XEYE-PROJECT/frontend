<script setup lang="ts">
const { locale, setLocale, locales } = useI18n()
</script>

<template>
  <UiDropdown align="right">
    <template #trigger>
      <UiButton variant="ghost" size="icon" :aria-label="$t('lang.label')" :title="$t('lang.label')">
        <UiIcon name="languages" :size="18" />
      </UiButton>
    </template>

    <template #default="{ close }">
      <UiDropdownItem
        v-for="l in locales"
        :key="l.code"
        icon="globe"
        @click="setLocale(l.code); close()"
      >
        <span class="flex-1">{{ l.label }}</span>
        <UiIcon v-if="l.code === locale" name="check" :size="16" class="text-primary" />
      </UiDropdownItem>
    </template>
  </UiDropdown>
</template>
