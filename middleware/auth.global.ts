import process from 'node:process'
import { useAuth } from '~/composables/auth'

const isTest = process.env.NODE_ENV === 'test'

const publicRoutes = new Set([
  '/login',
  '/register',
])

export default defineNuxtRouteMiddleware(async (to) => {
  if (isTest)
    return

  if (publicRoutes.has(to.path))
    return

  const { user, refreshUser } = useAuth()

  if (!user.value)
    await refreshUser()

  if (!user.value) {
    return navigateTo({
      path: '/login',
      query: {
        redirect: to.fullPath,
      },
    })
  }
})
