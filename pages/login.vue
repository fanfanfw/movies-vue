<script setup lang="ts">
import { useAuth } from '~/composables/auth'

const route = useRoute()
const { user, refreshUser, login } = useAuth()
const { t } = useI18n()

await refreshUser()

if (user.value)
  await navigateTo('/')

const identifier = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const statusMessage = computed(() => {
  if (route.query.status === 'pending')
    return route.query.registered ? t('Registration received. Your account is waiting for admin approval before you can write reviews.') : t('Your account is waiting for admin approval.')
  if (route.query.status === 'rejected')
    return t('Your account was rejected by an administrator.')
  return ''
})

async function submit() {
  error.value = ''
  loading.value = true

  try {
    await login({
      identifier: identifier.value,
      password: password.value,
    })

    const redirect = Array.isArray(route.query.redirect) ? route.query.redirect[0] : route.query.redirect
    await navigateTo(redirect || '/')
  }
  catch (e: any) {
    const status = e?.data?.data?.status
    if (status === 'pending' || status === 'rejected') {
      await navigateTo(`/login?status=${status}`)
      return
    }

    error.value = e?.statusMessage || e?.data?.message || t('Login failed. Please try again.')
  }
  finally {
    loading.value = false
  }
}

useHead({
  title: 'Login',
})
</script>

<template>
  <main min-h-full flex items-center justify-center p6>
    <form max-w-md w-full border="~ base" bg-white:5 p6 flex="~ col gap5" @submit.prevent="submit">
      <div>
        <h1 text-3xl font-serif>
          {{ $t('Login') }}
        </h1>
        <p mt2 op60>
          {{ $t('Sign in to write and manage your reviews.') }}
        </p>
      </div>

      <div v-if="statusMessage" border="~ primary/40" bg-primary:10 p4 text-sm>
        {{ statusMessage }}
      </div>
      <div v-if="error" border="~ red/40" bg-red:10 p4 text-sm text-red:1>
        {{ error }}
      </div>

      <label flex="~ col gap2">
        <span text-sm op70>{{ $t('Username or email') }}</span>
        <input v-model="identifier" required type="text" autocomplete="username" bg-black border="~ base" px4 py3 outline-none focus:border-primary>
      </label>

      <label flex="~ col gap2">
        <span text-sm op70>{{ $t('Password') }}</span>
        <input v-model="password" required type="password" autocomplete="current-password" bg-black border="~ base" px4 py3 outline-none focus:border-primary>
      </label>

      <button type="submit" :disabled="loading" bg-primary text-black font-bold px4 py3 disabled:op50>
        {{ loading ? $t('Signing in...') : $t('Login') }}
      </button>

      <p text-sm op70>
        {{ $t('No account yet?') }}
        <NuxtLink to="/register" n-link-text>
          {{ $t('Register') }}
        </NuxtLink>
      </p>
    </form>
  </main>
</template>
