import { describe, expect, it } from 'vitest'
import { assertEditableReviewStatus, reviewSubmissionSchema, serializePublicReview } from '~/server/utils/reviews'

describe('review utilities', () => {
  it('validates media type, TMDB id, and review length', () => {
    expect(reviewSubmissionSchema.safeParse({
      tmdbMediaType: 'movie',
      tmdbMediaId: '83533',
      content: 'A thoughtful review with enough detail.',
    }).success).toBe(true)

    expect(reviewSubmissionSchema.safeParse({
      tmdbMediaType: 'person',
      tmdbMediaId: '83533',
      content: 'A thoughtful review with enough detail.',
    }).success).toBe(false)

    expect(reviewSubmissionSchema.safeParse({
      tmdbMediaType: 'movie',
      tmdbMediaId: 'abc',
      content: 'A thoughtful review with enough detail.',
    }).success).toBe(false)

    expect(reviewSubmissionSchema.safeParse({
      tmdbMediaType: 'movie',
      tmdbMediaId: '83533',
      content: 'short',
    }).success).toBe(false)
  })

  it('replaces admin-hidden review content with a public placeholder', () => {
    const publicReview = serializePublicReview({
      id: 'review_1',
      user: {
        id: 'user_1',
        username: 'critic',
      },
      tmdbMediaType: 'movie',
      tmdbMediaId: '83533',
      content: 'Original content must not be public.',
      sentimentLabel: 'negative',
      status: 'hidden_by_admin',
      createdAt: new Date('2026-04-25T00:00:00.000Z'),
      updatedAt: new Date('2026-04-25T00:00:00.000Z'),
    } as any)

    expect(publicReview.content).toBe('This review has been hidden by an administrator.')
    expect(publicReview.user.username).toBe('critic')
    expect(publicReview.sentimentLabel).toBeNull()
    expect(publicReview.isModerationPlaceholder).toBe(true)
    expect(publicReview).not.toHaveProperty('sentimentConfidence')
    expect(publicReview).not.toHaveProperty('sentimentScoresJson')
  })

  it('replaces admin-deleted review content with a public placeholder', () => {
    const publicReview = serializePublicReview({
      id: 'review_1',
      user: {
        id: 'user_1',
        username: 'critic',
      },
      tmdbMediaType: 'tv',
      tmdbMediaId: '1399',
      content: 'Original content must not be public.',
      sentimentLabel: 'negative',
      status: 'deleted_by_admin',
      createdAt: new Date('2026-04-25T00:00:00.000Z'),
      updatedAt: new Date('2026-04-25T00:00:00.000Z'),
    } as any)

    expect(publicReview.content).toBe('This review was removed by an administrator.')
    expect(publicReview.user.username).toBe('critic')
    expect(publicReview.sentimentLabel).toBeNull()
    expect(publicReview.isModerationPlaceholder).toBe(true)
  })

  it('blocks user edits for admin-moderated reviews', () => {
    expect(() => assertEditableReviewStatus('visible')).not.toThrow()
    expect(() => assertEditableReviewStatus('deleted_by_user')).not.toThrow()
    expect(() => assertEditableReviewStatus('hidden_by_admin')).toThrow('This review has been moderated and cannot be edited.')
    expect(() => assertEditableReviewStatus('deleted_by_admin')).toThrow('This review has been moderated and cannot be edited.')
  })
})
