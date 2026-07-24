<script setup lang="ts">
const auth = useAuthStore()
const user = computed(() => auth.user)

function goTo(path: string, close: () => void) {
  close()
  navigateTo(path)
}

function signOut(close: () => void) {
  close()
  auth.logout()
}
</script>

<template>
  <UiDropdown align="right">
    <template #trigger>
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-surface-2"
      >
        <span
          class="bg-brand-gradient grid h-8 w-8 place-items-center rounded-full text-xs font-semibold text-white"
        >
          {{ initials(user?.name, user?.surname) }}
        </span>
        <span class="hidden max-w-[8rem] truncate text-sm font-medium text-fg sm:block">
          {{ user?.name }}
        </span>
        <UiIcon name="chevron-down" :size="15" class="text-subtle" />
      </button>
    </template>

    <template #default="{ close }">
      <div class="border-b border-line px-2.5 py-2">
        <p class="truncate text-sm font-medium text-fg">{{ user?.name }} {{ user?.surname }}</p>
        <p class="truncate text-xs text-subtle">{{ user?.email }}</p>
      </div>
      <div class="pt-1">
        <UiDropdownItem icon="user" @click="goTo('/account', close)">
          {{ $t('nav.account') }}
        </UiDropdownItem>
        <UiDropdownItem icon="logout" danger @click="signOut(close)">
          {{ $t('nav.logout') }}
        </UiDropdownItem>
      </div>
    </template>
  </UiDropdown>
</template>
