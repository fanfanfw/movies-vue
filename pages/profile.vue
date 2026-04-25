<script setup lang="ts">
import { useAuth } from '~/composables/auth'

interface UserReview {
  id: string
  tmdbMediaType: 'movie' | 'tv'
  tmdbMediaId: string
  tmdbTitleSnapshot: string
  tmdbPosterPathSnapshot: string | null
  content: string
  sentimentLabel: string
  status: 'visible' | 'hidden_by_admin' | 'deleted_by_admin' | 'deleted_by_user'
  createdAt: string
  updatedAt: string
}

const { user, refreshUser, isAdmin } = useAuth()
const { t } = useI18n()

await refreshUser()

if (!user.value)
  await navigateTo('/login?redirect=/profile')

const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
const { data: reviewsData, refresh: refreshReviews } = await useFetch<{ reviews: UserReview[] }>('/api/user/reviews', {
  headers,
  default: () => ({ reviews: [] }),
})
const busyReviewId = ref('')
const reviewError = ref('')

function statusLabel(status: UserReview['status']) {
  if (status === 'visible')
    return t('Visible')
  if (status === 'hidden_by_admin')
    return t('Hidden by admin')
  if (status === 'deleted_by_admin')
    return t('Removed by admin')
  return t('Deleted')
}

async function deleteReview(reviewId: string) {
  reviewError.value = ''
  busyReviewId.value = reviewId

  try {
    await $fetch(`/api/reviews/${reviewId}`, {
      method: 'DELETE',
    })
    await refreshReviews()
  }
  catch (e: any) {
    reviewError.value = e?.statusMessage || e?.data?.message || t('Review could not be deleted. Please try again.')
  }
  finally {
    busyReviewId.value = ''
  }
}

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
      <div v-if="reviewError" border="~ red/40" bg-red:10 p4 text-sm text-red:1>
        {{ reviewError }}
      </div>
      <div v-if="!reviewsData?.reviews.length" border="~ base" bg-white:5 p5 op70>
        {{ $t('No reviews yet.') }}
      </div>
      <div v-else flex="~ col">
        <article
          v-for="review in reviewsData.reviews"
          :key="review.id"
          border="b base"
          py5 flex="~ col md:row gap4"
        >
          <NuxtLink :to="`/${review.tmdbMediaType}/${review.tmdbMediaId}`" flex="~ col gap1" flex-1 n-link>
            <span text-xl>{{ review.tmdbTitleSnapshot }}</span>
            <span text-sm op60>{{ review.tmdbMediaType.toUpperCase() }} · {{ new Date(review.updatedAt).toLocaleDateString() }}</span>
          </NuxtLink>
          <div flex="~ col gap3" md:w-lg>
            <div flex flex-wrap gap2 text-sm>
              <span border="~ primary/40" px2 py1>{{ review.sentimentLabel }}</span>
              <span border="~ base" px2 py1>{{ statusLabel(review.status) }}</span>
            </div>
            <p line-clamp-3 op80>
              {{ review.content }}
            </p>
            <button
              v-if="review.status === 'visible'"
              type="button"
              border="~ red/50"
              text-red:1
              px3 py2 w-max
              :disabled="!!busyReviewId"
              disabled:op40
              @click="deleteReview(review.id)"
            >
              {{ busyReviewId === review.id ? $t('Working...') : $t('Delete') }}
            </button>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>
