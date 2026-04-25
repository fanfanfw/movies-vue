<script setup lang="ts">
import { useAuth } from '~/composables/auth'

const { user, refreshUser, isAdmin } = useAuth()

await refreshUser()

if (!user.value)
  await navigateTo('/login?redirect=/admin')

if (user.value && !isAdmin.value)
  throw createError({ statusCode: 403, statusMessage: 'Admin access required.' })

useHead({
  title: 'Admin',
})
</script>

<template>
  <main min-h-full p6 md:p10 flex="~ col gap8">
    <header flex="~ col gap3">
      <h1 text-4xl font-serif>
        {{ $t('Admin dashboard') }}
      </h1>
      <p op60>
        {{ $t('Manage account approvals and moderation tools.') }}
      </p>
    </header>

    <section grid="~ cols-1 md:cols-3 gap4">
      <NuxtLink to="/admin/approvals" border="~ base" bg-white:5 p5 hover:bg-white:10 transition>
        <div i-ph-user-check text-3xl text-primary />
        <h2 mt4 text-xl>
          {{ $t('Approval queue') }}
        </h2>
        <p mt2 op60>
          {{ $t('Approve or reject newly registered users.') }}
        </p>
      </NuxtLink>
    </section>
  </main>
</template>
