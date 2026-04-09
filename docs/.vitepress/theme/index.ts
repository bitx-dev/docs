import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router }) {
    // Force light mode on app initialization
    if (typeof window !== 'undefined') {
      // Set light mode in localStorage
      localStorage.setItem('vitepress-theme-appearance', 'light')
      // Remove dark class if present
      document.documentElement.classList.remove('dark')
    }
  }
} satisfies Theme
