<script setup lang="ts">
import { useAuth } from '~/composables/auth'

const { user, refreshUser, isAdmin } = useAuth()

await refreshUser()

if (!user.value)
  await navigateTo('/login?redirect=/profile')

useHead({
  title: 'Profile',
})
</script>

<template>
  <main v-if="user" min-h-full p6 md:p10 flex="~ col gap8">
    <header flex="~ col gap3">
      <h1 text-4xl font-serif>
        {{ $t('Profile') }}
      </h1>
      <p op60>
        {{ $t('Account and review activity.') }}
      </p>
    </header>

    <section border="~ base" bg-white:5 p5 max-w-3xl>
      <dl grid="~ cols-1 md:cols-2 gap5">
        <div>
          <dt text-sm op60>
            {{ $t('Username') }}
          </dt>
          <dd text-xl>
            {{ user.username }}
          </dd>
        </div>
        <div>
          <dt text-sm op60>
            {{ $t('Email') }}
          </dt>
          <dd text-xl break-all>
            {{ user.email }}
          </dd>
        </div>
        <div>
          <dt text-sm op60>
            {{ $t('Role') }}
          </dt>
          <dd text-xl capitalize>
            {{ user.role }}
          </dd>
        </div>
        <div>
          <dt text-sm op60>
            {{ $t('Approval status') }}
          </dt>
          <dd text-xl capitalize>
            {{ user.approvalStatus }}
          </dd>
        </div>
        <div>
          <dt text-sm op60>
            {{ $t('Joined') }}
          </dt>
          <dd text-xl>
            {{ new Date(user.createdAt).toLocaleDateString() }}
          </dd>
        </div>
      </dl>
    </section>

    <section flex="~ col gap4">
      <div flex items-center justify-between gap4>
        <h2 text-2xl font-serif>
          {{ $t('Your reviews') }}
        </h2>
        <NuxtLink v-if="isAdmin" to="/admin" n-link-text>
          {{ $t('Admin dashboard') }}
        </NuxtLink>
      </div>
      <div border="~ base" bg-white:5 p5 op70>
        {{ $t('Your review history will appear here after review storage is enabled.') }}
      </div>
    </section>
  </main>
</template>
