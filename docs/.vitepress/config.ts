import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "BitXPay Documentation",
  description: "Official API documentation for BitXPay - Cryptocurrency Payment Gateway",

  // Base path for GitHub Pages (repo name)
  base: '/docs/',

  // Clean URLs without .html extension
  cleanUrls: true,

  // SEO: Generate sitemap
  sitemap: {
    hostname: 'https://docs.bitxpay.com'
  },

  // Head tags for SEO
  head: [
    ['meta', { name: 'theme-color', content: '#3c8cff' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'BitXPay Documentation' }],
    ['meta', { property: 'og:image', content: 'https://docs.bitxpay.com/og-image.png' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
  ],

  themeConfig: {
    // Site logo
    logo: '/logo.svg',

    // Navigation bar
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started/' },
      { text: 'API Reference', link: '/api-reference/' },
      { text: 'Security', link: '/security/' }
    ],

    // Sidebar - auto-generated from folder structure
    sidebar: {
      '/getting-started/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Overview', link: '/getting-started/' },
            { text: 'Quick Start', link: '/getting-started/quick-start' },
            { text: 'Installation', link: '/getting-started/installation' }
          ]
        }
      ],
      '/integration/': [
        {
          text: 'Integration',
          items: [
            { text: 'Overview', link: '/integration/' },
            { text: 'Webhooks', link: '/integration/webhooks' },
            { text: 'Environments', link: '/integration/environments' }
          ]
        }
      ],
      '/api-reference/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api-reference/' },
            { text: 'Authentication', link: '/api-reference/authentication' },
            { text: 'Payments', link: '/api-reference/payments' },
            { text: 'Wallets', link: '/api-reference/wallets' }
          ]
        }
      ],
      '/security/': [
        {
          text: 'Security',
          items: [
            { text: 'Overview', link: '/security/' },
            { text: 'Authentication', link: '/security/authentication' },
            { text: 'Best Practices', link: '/security/best-practices' }
          ]
        }
      ]
    },

    // Social links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/bitxpay' }
    ],

    // Search configuration (built-in local search)
    search: {
      provider: 'local',
      options: {
        detailedView: true
      }
    },

    // Footer
    footer: {
      message: 'BitXPay - Cryptocurrency Payment Gateway',
      copyright: 'Copyright © 2024 BitXPay'
    },

    // Edit link
    editLink: {
      pattern: 'https://github.com/bitxpay/docs/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    // Last updated
    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    },

    // Outline configuration (table of contents)
    outline: {
      level: [2, 3],
      label: 'On this page'
    }
  },

  // Markdown configuration
  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  }
})
