import type { H3Event } from 'h3'
import { createError, getHeader, getRequestIP } from 'h3'

interface RateLimitBucket {
  count: number
  resetAt: number
}

interface RateLimitOptions {
  key: string
  limit: number
  windowMs: number
}

const buckets = new Map<string, RateLimitBucket>()

export function getClientIp(event: H3Event) {
  return getRequestIP(event, { xForwardedFor: true }) || 'unknown'
}

export function assertValidOrigin(event: H3Event) {
  const method = event.method.toUpperCase()
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS')
    return

  const config = useRuntimeConfig(event)
  const expectedOrigin = config.appOrigin
  const origin = getHeader(event, 'origin')

  if (!origin || origin !== expectedOrigin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid request origin.',
    })
  }
}

export function assertRateLimit({ key, limit, windowMs }: RateLimitOptions) {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    })
    return
  }

  bucket.count += 1

  if (bucket.count > limit) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
    throw createError({
      statusCode: 429,
      statusMessage: `Too many requests. Try again in ${retryAfter} seconds.`,
    })
  }
}
