<script setup lang="ts">
import { useAuth } from '~/composables/auth'
import '@unocss/reset/tailwind.css'

const { user, refreshUser } = useAuth()

await refreshUser()

const showNavBar = computed(() => !!user.value)

useHead({
  htmlAttrs: {
    lang: 'en',
  },
  title: 'Nuxt Movies',
  titleTemplate: title => (title !== 'Nuxt Movies' ? `${title} · Nuxt Movies` : title),
  meta: [
    { charset: 'utf-8' },
    { name: 'description', content: 'A TMDB client built with Nuxt Image to show the potential of it ✨' },
    { property: 'og:image', content: 'https://movies.nuxt.space/social-card.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: '@nuxt_js' },
    { name: 'twitter:creator', content: '@nuxt_js' },
  ],
  link: [
    {
      rel: 'icon',
      type: 'image/webp',
      href: '/movies.webp',
    },
  ],
})
</script>

<template>
  <NuxtLoadingIndicator />
  <div
    h-full
    w-full
    font-sans
    of-hidden
    view-transition-app
    transition
    duration-0
    :class="showNavBar ? 'grid lt-lg:grid-rows-[1fr_max-content] lg:grid-cols-[max-content_1fr]' : 'block'"
  >
    <div id="app-scroller" of-x-hidden of-y-auto relative>
      <NuxtPage />
    </div>
    <NavBar v-if="showNavBar" lg:order-first />
    <IframeModal />
    <PhotoModal />
  </div>
</template>

<style>
html,
body,
#__nuxt {
  height: 100vh;
  margin: 0;
  padding: 0;
  background: #111;
  color: white;
  color-scheme: dark;
}
</style>
