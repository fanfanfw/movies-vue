import { getCurrentUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getCurrentUser(event)

  return {
    user: user
      ? {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          approvalStatus: user.approvalStatus,
          createdAt: user.createdAt.toISOString(),
        }
      : null,
  }
})
