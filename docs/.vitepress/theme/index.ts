import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import apiEndpointsPlugin from '../plugins/api-endpoints-plugin'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router }) {
    // Register API endpoints plugin
    app.use(apiEndpointsPlugin)

    // Force light mode on app initialization
    if (typeof window !== 'undefined') {
      // Set light mode in localStorage
      localStorage.setItem('vitepress-theme-appearance', 'light')
      // Remove dark class if present
      document.documentElement.classList.remove('dark')
    }
  }
} satisfies Theme
