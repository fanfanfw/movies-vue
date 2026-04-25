<script setup lang="ts">
import { useAuth } from '~/composables/auth'

interface AdminUser {
  id: string
  username: string
  email: string
  role: 'admin' | 'user'
  approvalStatus: 'pending' | 'approved' | 'rejected'
  approvedAt: string | null
  createdAt: string
  reviewCount: number
}

const { user, refreshUser, isAdmin } = useAuth()
const { t } = useI18n()

await refreshUser()

if (!user.value)
  await navigateTo('/login?redirect=/admin/users')

if (user.value && !isAdmin.value)
  throw createError({ statusCode: 403, statusMessage: 'Admin access required.' })

const filters = reactive({
  q: '',
  role: 'all',
  approvalStatus: 'all',
})
const query = computed(() => ({
  q: filters.q || undefined,
  role: filters.role,
  approvalStatus: filters.approvalStatus,
}))
const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
const { data, pending, error, refresh } = await useFetch<{ users: AdminUser[] }>('/api/admin/users', {
  headers,
  query,
  default: () => ({ users: [] }),
})

function approvalLabel(status: AdminUser['approvalStatus']) {
  if (status === 'approved')
    return t('Approved')
  if (status === 'rejected')
    return t('Rejected')
  return t('Pending')
}

useHead({
  title: 'User list',
})
</script>

<template>
  <main min-h-full p6 md:p10 flex="~ col gap8">
    <header flex="~ col gap3">
      <NuxtLink to="/admin" n-link-text w-max>
        {{ $t('Admin dashboard') }}
      </NuxtLink>
      <h1 text-4xl font-serif>
        {{ $t('User list') }}
      </h1>
      <p op60>
        {{ $t('Review user roles, approval status, and activity.') }}
      </p>
    </header>

    <form flex="~ col lg:row gap3" lg:items-end :aria-busy="pending" @submit.prevent="() => refresh()">
      <label flex="~ col gap2" flex-1>
        <span text-sm op70>{{ $t('Search') }}</span>
        <input v-model="filters.q" type="search" border="~ base" bg-black p3 min-h-11 outline-none focus:border-primary :placeholder="$t('Username or email')">
      </label>
      <label flex="~ col gap2">
        <span text-sm op70>{{ $t('Role') }}</span>
        <select v-model="filters.role" border="~ base" bg-black p3 min-h-11 outline-none focus:border-primary>
          <option value="all">
            {{ $t('All roles') }}
          </option>
          <option value="admin">
            {{ $t('Admin') }}
          </option>
          <option value="user">
            {{ $t('User') }}
          </option>
        </select>
      </label>
      <label flex="~ col gap2">
        <span text-sm op70>{{ $t('Approval status') }}</span>
        <select v-model="filters.approvalStatus" border="~ base" bg-black p3 min-h-11 outline-none focus:border-primary>
          <option value="all">
            {{ $t('All approval statuses') }}
          </option>
          <option value="pending">
            {{ $t('Pending') }}
          </option>
          <option value="approved">
            {{ $t('Approved') }}
          </option>
          <option value="rejected">
            {{ $t('Rejected') }}
          </option>
        </select>
      </label>
      <button type="submit" border="~ primary/50" px4 py3 min-h-11 h-max focus:outline-primary>
        {{ $t('Apply filters') }}
      </button>
    </form>

    <div v-if="pending" border="~ base" bg-white:5 p5 op70>
      {{ $t('Loading...') }}
    </div>
    <div v-else-if="error" border="~ red/40" bg-red:10 p5 text-red:1 role="alert">
      {{ $t('Users could not be loaded right now.') }}
    </div>
    <div v-else-if="!data?.users.length" border="~ base" bg-white:5 p5 op70>
      {{ $t('No users match these filters.') }}
    </div>
    <div v-else border="~ base" overflow-x-auto aria-label="Users table">
      <table w-full text-left text-sm>
        <thead bg-white:8>
          <tr>
            <th p4 font-normal op70 scope="col">
              {{ $t('Username') }}
            </th>
            <th p4 font-normal op70 scope="col">
              {{ $t('Email') }}
            </th>
            <th p4 font-normal op70 scope="col">
              {{ $t('Role') }}
            </th>
            <th p4 font-normal op70 scope="col">
              {{ $t('Approval status') }}
            </th>
            <th p4 font-normal op70 scope="col">
              {{ $t('Reviews') }}
            </th>
            <th p4 font-normal op70 scope="col">
              {{ $t('Joined') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="listedUser in data.users" :key="listedUser.id" border="t base">
            <td p4 font-bold>
              {{ listedUser.username }}
            </td>
            <td p4 break-all>
              {{ listedUser.email }}
            </td>
            <td p4 capitalize>
              {{ listedUser.role }}
            </td>
            <td p4>
              <span border="~ base" px2 py1>{{ approvalLabel(listedUser.approvalStatus) }}</span>
            </td>
            <td p4>
              {{ listedUser.reviewCount }}
            </td>
            <td p4>
              {{ new Date(listedUser.createdAt).toLocaleDateString() }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>
