<script setup lang="ts">
import { useAuth } from '~/composables/auth'

const { user, refreshUser, register } = useAuth()
const { t } = useI18n()

await refreshUser()

if (user.value)
  await navigateTo('/')

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = t('Passwords do not match.')
    return
  }

  loading.value = true

  try {
    await register({
      username: username.value,
      email: email.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
    })
    await navigateTo('/login?status=pending&registered=1')
  }
  catch (e: any) {
    error.value = e?.statusMessage || e?.data?.message || t('Registration failed. Please check your details.')
  }
  finally {
    loading.value = false
  }
}

useHead({
  title: 'Register',
})
</script>

<template>
  <main min-h-full flex items-center justify-center p6>
    <form max-w-md w-full border="~ base" bg-white:5 p6 flex="~ col gap5" @submit.prevent="submit">
      <div>
        <h1 text-3xl font-serif>
          {{ $t('Register') }}
        </h1>
        <p mt2 op60>
          {{ $t('Create an account. An admin must approve it before review access is enabled.') }}
        </p>
      </div>

      <div v-if="error" border="~ red/40" bg-red:10 p4 text-sm text-red:1>
        {{ error }}
      </div>

      <label flex="~ col gap2">
        <span text-sm op70>{{ $t('Username') }}</span>
        <input v-model="username" required type="text" minlength="3" maxlength="32" autocomplete="username" bg-black border="~ base" px4 py3 outline-none focus:border-primary>
      </label>

      <label flex="~ col gap2">
        <span text-sm op70>{{ $t('Email') }}</span>
        <input v-model="email" required type="email" autocomplete="email" bg-black border="~ base" px4 py3 outline-none focus:border-primary>
      </label>

      <label flex="~ col gap2">
        <span text-sm op70>{{ $t('Password') }}</span>
        <input v-model="password" required type="password" minlength="8" autocomplete="new-password" bg-black border="~ base" px4 py3 outline-none focus:border-primary>
      </label>

      <label flex="~ col gap2">
        <span text-sm op70>{{ $t('Confirm password') }}</span>
        <input v-model="confirmPassword" required type="password" minlength="8" autocomplete="new-password" bg-black border="~ base" px4 py3 outline-none focus:border-primary>
      </label>

      <button type="submit" :disabled="loading" bg-primary text-black font-bold px4 py3 disabled:op50>
        {{ loading ? $t('Creating account...') : $t('Register') }}
      </button>

      <p text-sm op70>
        {{ $t('Already have an account?') }}
        <NuxtLink to="/login" n-link-text>
          {{ $t('Login') }}
        </NuxtLink>
      </p>
    </form>
  </main>
</template>
