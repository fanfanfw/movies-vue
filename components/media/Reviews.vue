<script setup lang="ts">
import type { Media, MediaType } from '~/types'
import { useAuth } from '~/composables/auth'

interface PublicReview {
  id: string
  user: {
    id: string
    username: string
  }
  tmdbMediaType: MediaType
  tmdbMediaId: string
  content: string
  sentimentLabel: 'positive' | 'negative' | null
  status: 'visible' | 'hidden_by_admin' | 'deleted_by_admin' | 'deleted_by_user'
  isModerationPlaceholder: boolean
  createdAt: string
  updatedAt: string
}

interface CurrentUserReview {
  id: string
  content: string
  sentimentLabel: 'positive' | 'negative'
  status: 'visible' | 'hidden_by_admin' | 'deleted_by_admin' | 'deleted_by_user'
  createdAt: string
  updatedAt: string
}

interface ReviewsResponse {
  reviews: PublicReview[]
  currentUserReview: CurrentUserReview | null
}

interface ReviewSubmitResponse {
  review: CurrentUserReview
  classification: {
    label: 'positive' | 'negative'
    is_positive: boolean
  }
}

const props = defineProps<{
  item: Media
  type: MediaType
}>()

const { user, refreshUser } = useAuth()

await refreshUser()

const { t } = useI18n()
const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
const mediaId = computed(() => props.item.id.toString())
const feedbackTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const { data, pending, error, refresh } = await useFetch<ReviewsResponse>('/api/reviews', {
  headers,
  query: {
    type: props.type,
    tmdbId: mediaId.value,
  },
  default: () => ({
    reviews: [],
    currentUserReview: null,
  }),
})

const content = ref('')
const submitting = ref(false)
const deleting = ref(false)
const submitError = ref('')
const feedback = ref<{
  label: 'positive' | 'negative'
  message: string
} | null>(null)

const currentUserReview = computed(() => data.value?.currentUserReview ?? null)
const canWriteReview = computed(() => user.value?.approvalStatus === 'approved')
const isEditMode = computed(() => !!currentUserReview.value)

const sortedReviews = computed(() => {
  const reviews = data.value?.reviews ?? []
  if (!user.value)
    return reviews

  return [...reviews].sort((a, b) => {
    if (a.user.id === user.value?.id)
      return -1
    if (b.user.id === user.value?.id)
      return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

watch(
  currentUserReview,
  (review) => {
    content.value = review?.content ?? ''
  },
  { immediate: true },
)

function showFeedback(label: 'positive' | 'negative') {
  if (feedbackTimer.value)
    clearTimeout(feedbackTimer.value)

  feedback.value = {
    label,
    message: label === 'positive'
      ? t('Thanks for sharing a bright take. Your review adds a helpful positive signal for this title.')
      : t('Thanks for the honest critique. Your review helps others understand a different side of this title.'),
  }

  feedbackTimer.value = setTimeout(() => {
    feedback.value = null
  }, 1400)
}

async function submitReview() {
  if (submitting.value)
    return

  submitError.value = ''
  submitting.value = true

  try {
    const body = { content: content.value }
    const response = currentUserReview.value
      ? await $fetch<ReviewSubmitResponse>(`/api/reviews/${currentUserReview.value.id}`, {
        method: 'PATCH',
        body,
      })
      : await $fetch<ReviewSubmitResponse>('/api/reviews', {
        method: 'POST',
        body: {
          tmdbMediaType: props.type,
          tmdbMediaId: mediaId.value,
          content: content.value,
        },
      })

    await refresh()
    showFeedback(response.classification.label)
  }
  catch (e: any) {
    submitError.value = e?.statusMessage || e?.data?.message || t('Review could not be analyzed right now. Please try again.')
  }
  finally {
    submitting.value = false
  }
}

async function deleteReview() {
  if (!currentUserReview.value || deleting.value)
    return

  submitError.value = ''
  deleting.value = true

  try {
    await $fetch(`/api/reviews/${currentUserReview.value.id}`, {
      method: 'DELETE',
    })
    content.value = ''
    await refresh()
  }
  catch (e: any) {
    submitError.value = e?.statusMessage || e?.data?.message || t('Review could not be deleted. Please try again.')
  }
  finally {
    deleting.value = false
  }
}

onBeforeUnmount(() => {
  if (feedbackTimer.value)
    clearTimeout(feedbackTimer.value)
})
</script>

<template>
  <section max-w-300 ma p4 flex="~ col gap8">
    <div
      border="~ base"
      bg-white:5
      p5
      relative
      overflow-hidden
      class="review-panel"
      :class="{
        'review-panel-positive': feedback?.label === 'positive',
        'review-panel-negative': feedback?.label === 'negative',
        'review-panel-loading': submitting,
      }"
    >
      <div flex="~ col md:row gap5" md:items-start>
        <div flex-1>
          <h2 text-2xl font-serif>
            {{ $t('Audience reviews') }}
          </h2>
          <p mt2 op60>
            {{ $t('Share one thoughtful review in English so the sentiment model can analyze it accurately.') }}
          </p>
        </div>

        <NuxtLink v-if="!user" to="/login" border="~ primary/50" px4 py2 h-max>
          {{ $t('Log in to write a review.') }}
        </NuxtLink>
      </div>

      <form v-if="canWriteReview" mt6 flex="~ col gap4" @submit.prevent="submitReview">
        <label flex="~ col gap2">
          <span text-sm op70>{{ isEditMode ? $t('Edit your review') : $t('Write a review') }}</span>
          <textarea
            v-model="content"
            minlength="10"
            maxlength="2000"
            required
            rows="6"
            :disabled="submitting || deleting"
            bg-black
            border="~ base"
            p4
            outline-none
            resize-y
            focus:border-primary
            :placeholder="$t('Write at least 10 characters in English.')"
          />
        </label>

        <div flex="~ col md:row gap3" md:items-center md:justify-between>
          <p text-sm op50>
            {{ content.length }}/2000
          </p>
          <div flex gap3>
            <button
              v-if="isEditMode"
              type="button"
              border="~ red/50"
              text-red:1
              px4 py2
              :disabled="submitting || deleting"
              disabled:op40
              @click="deleteReview"
            >
              {{ deleting ? $t('Deleting...') : $t('Delete') }}
            </button>
            <button type="submit" bg-primary text-black font-bold px5 py2 :disabled="submitting || deleting" disabled:op50>
              {{ submitting ? $t('Analyzing...') : isEditMode ? $t('Update review') : $t('Submit review') }}
            </button>
          </div>
        </div>

        <div v-if="submitError" border="~ red/40" bg-red:10 p4 text-sm text-red:1>
          {{ submitError }}
        </div>
      </form>

      <div v-else-if="user" mt6 border="~ primary/30" bg-primary:10 p4 op90>
        {{ $t('Your account must be approved before you can write reviews.') }}
      </div>

      <div v-if="feedback" mt5 aria-live="polite" border="~ base" p4 :class="feedback.label === 'positive' ? 'bg-primary:10' : 'bg-blue:10'">
        {{ feedback.message }}
      </div>
    </div>

    <div flex="~ col gap4">
      <div flex items-center justify-between gap4>
        <h2 text-2xl font-serif>
          {{ $t('Reviews') }}
        </h2>
        <button type="button" n-link text-sm @click="() => refresh()">
          {{ $t('Refresh') }}
        </button>
      </div>

      <div v-if="pending" border="~ base" bg-white:5 p5 op70>
        {{ $t('Loading reviews...') }}
      </div>
      <div v-else-if="error" border="~ red/40" bg-red:10 p5 text-red:1>
        {{ $t('Reviews could not be loaded right now.') }}
      </div>
      <div v-else-if="!sortedReviews.length" border="~ base" bg-white:5 p5 op70>
        {{ user ? $t('No reviews yet. Be the first to write one.') : $t('Log in to write the first review.') }}
      </div>
      <article
        v-for="review in sortedReviews"
        v-else
        :key="review.id"
        border="~ base"
        bg-white:5
        p5
        flex="~ col gap3"
        :class="{ op75: review.isModerationPlaceholder }"
      >
        <div flex="~ col md:row gap3" md:items-center md:justify-between>
          <div>
            <div font-bold>
              {{ review.user.username }}
            </div>
            <div text-sm op55>
              {{ new Date(review.createdAt).toLocaleDateString() }}
            </div>
          </div>
          <span v-if="review.sentimentLabel" border="~ primary/40" px3 py1 text-sm capitalize w-max>
            {{ review.sentimentLabel }}
          </span>
        </div>
        <p whitespace-pre-wrap leading-7 :class="{ italic: review.isModerationPlaceholder }">
          {{ review.content }}
        </p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.review-panel::before,
.review-panel::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
}

.review-panel-positive::before {
  background: radial-gradient(circle at 80% 20%, rgb(64 193 173 / 28%), transparent 34%);
  animation: warm-review-glow 1200ms ease-out;
}

.review-panel-positive::after {
  background-image:
    radial-gradient(circle, rgb(255 255 255 / 70%) 0 1px, transparent 2px),
    radial-gradient(circle, rgb(64 193 173 / 80%) 0 1px, transparent 2px);
  background-position: 72% 42%, 82% 26%;
  background-size: 36px 36px, 52px 52px;
  animation: review-sparkle 1200ms ease-out;
}

.review-panel-negative::before {
  background: linear-gradient(115deg, transparent, rgb(65 105 180 / 18%), transparent);
  animation: cool-review-ripple 1200ms ease-out;
}

.review-panel-negative::after {
  background: repeating-linear-gradient(0deg, transparent 0 7px, rgb(255 255 255 / 5%) 8px 9px);
  animation: review-scanline 1200ms ease-out;
}

.review-panel-loading::before {
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 8%), transparent);
  animation: review-loading-scan 1100ms linear infinite;
  opacity: 1;
}

@keyframes warm-review-glow {
  0% { opacity: 0; transform: scale(0.95); }
  35% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.05); }
}

@keyframes review-sparkle {
  0% { opacity: 0; transform: translateY(8px); }
  30% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-18px); }
}

@keyframes cool-review-ripple {
  0% { opacity: 0; transform: translateX(-45%); }
  35% { opacity: 1; }
  100% { opacity: 0; transform: translateX(45%); }
}

@keyframes review-scanline {
  0% { opacity: 0; transform: translateY(-8px); }
  30% { opacity: 0.8; }
  100% { opacity: 0; transform: translateY(8px); }
}

@keyframes review-loading-scan {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@media (prefers-reduced-motion: reduce) {
  .review-panel::before,
  .review-panel::after {
    animation: none;
  }
}
</style>
