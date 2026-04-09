<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'
import DefaultTheme from 'vitepress/theme'
import Footer from './Footer.vue'

const { page, frontmatter } = useData()
const isHome = computed(() => {
  // Only show footer on the root index page
  return page.value.relativePath === 'index.md' && frontmatter.value.layout === 'home'
})
</script>

<template>
  <DefaultTheme.Layout>
    <template #layout-bottom>
      <Footer v-if="isHome" />
    </template>
  </DefaultTheme.Layout>
</template>
