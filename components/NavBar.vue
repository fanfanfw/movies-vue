<script setup lang="ts">
import { useAuth } from '~/composables/auth'

const { user, isAdmin, refreshUser, logout } = useAuth()

await refreshUser()

async function handleLogout() {
  await logout()
  await navigateTo('/')
}
</script>

<template>
  <div
    v-if="user"
    flex="~ row lg:col"
    justify-evenly items-center
    py5 lg:px5
    border="t lg:r base"
    bg-black
  >
    <NuxtLink v-slot="{ isActive }" to="/" :title="$t('Home')" :aria-label="$t('Home')">
      <div
        text-2xl
        :class="isActive ? 'i-ph-house-fill text-primary' : 'i-ph-house'"
      />
      <span sr-only>{{ $t('Home') }}</span>
    </NuxtLink>
    <NuxtLink v-slot="{ isActive }" to="/movie" :title="$t('Movies')" :aria-label="$t('Movies')">
      <div
        text-2xl
        :class="isActive ? 'i-ph-film-strip-fill text-primary' : 'i-ph-film-strip'"
      />
      <span sr-only>{{ $t('Movies') }}</span>
    </NuxtLink>
    <NuxtLink v-slot="{ isActive }" to="/tv" :title="$t('TV Shows')" :aria-label="$t('TV Shows')">
      <div
        text-2xl
        :class="isActive ? 'i-ph-television-simple-fill text-primary' : 'i-ph-television-simple'"
      />
      <span sr-only>{{ $t('TV Shows') }}</span>
    </NuxtLink>
    <NuxtLink v-slot="{ isActive }" to="/search" :title="$t('Search')" :aria-label="$t('Search')">
      <div
        text-2xl
        :class="isActive ? 'i-ph-magnifying-glass-fill text-primary' : 'i-ph-magnifying-glass'"
      />
      <span sr-only>{{ $t('Search') }}</span>
    </NuxtLink>
    <NuxtLink v-if="isAdmin" v-slot="{ isActive }" to="/admin" :title="$t('Admin')" :aria-label="$t('Admin')">
      <div
        text-2xl
        :class="isActive ? 'i-ph-shield-star-fill text-primary' : 'i-ph-shield-star'"
      />
      <span sr-only>{{ $t('Admin') }}</span>
    </NuxtLink>
    <NuxtLink v-slot="{ isActive }" to="/profile" :title="$t('Profile')" :aria-label="$t('Profile')">
      <div
        text-2xl
        :class="isActive ? 'i-ph-user-circle-fill text-primary' : 'i-ph-user-circle'"
      />
      <span sr-only>{{ $t('Profile') }}</span>
    </NuxtLink>
    <button type="button" :title="$t('Logout')" :aria-label="$t('Logout')" n-link @click="handleLogout">
      <div i-ph-sign-out text-2xl />
      <span sr-only>{{ $t('Logout') }}</span>
    </button>
  </div>
</template>
