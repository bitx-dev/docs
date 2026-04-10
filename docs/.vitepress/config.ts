import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "BitXPay Documentation",
  description: "Official API documentation for BitXPay - Cryptocurrency Payment Gateway",

  // Base path: root for both local and production
  base: '/',

  // Clean URLs without .html extension
  cleanUrls: true,

  // SEO: Generate sitemap
  sitemap: {
    hostname: 'https://docs.bitxpay.com'
  },

  // Head tags for SEO
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],
    ['meta', { name: 'theme-color', content: '#3b82f6' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'BitXPay Documentation' }],
    ['meta', { property: 'og:image', content: 'https://docs.bitxpay.com/docs/og-image.png' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap', rel: 'stylesheet' }]
  ],

  themeConfig: {
    // Site logo
    logo: '/logo.svg',

    // Navigation bar
    nav: [
      { text: 'Home', link: '/' },
      { 
        text: 'Documentation',
        items: [
          { text: 'Get Started', link: '/get-started/' },
          { text: 'API Reference', link: '/api-reference/' },
          { text: 'Integration', link: '/integration/' },
          { text: 'Security', link: '/security/' }
        ]
      },
      { 
        text: 'Resources',
        items: [
          { text: 'SDKs & Libraries', link: '/get-started/sdks-libraries' },
          { text: 'Testing Tools', link: '/testing/' },
          { text: 'Webhooks', link: '/get-started/webhooks' }
        ]
      },
      { 
        text: 'Support',
        items: [
          { text: 'Troubleshooting', link: '/testing/troubleshooting' },
          { text: 'Contribute', link: '/contribution/' },
          { text: 'GitHub', link: 'https://github.com/bitxpay' },
          { text: 'Discord', link: 'https://discord.gg/bitxpay' }
        ]
      }
    ],

    // Sidebar - auto-generated from folder structure
    sidebar: {
      '/get-started/': [
        {
          text: 'Get Started',
          items: [
            { text: 'Introduction', link: '/get-started/' },
            { text: 'Supported Networks', link: '/get-started/supported-networks' },
            { text: 'Authentication', link: '/get-started/authentication' },
            { text: 'Quick Start', link: '/get-started/quick-start' },
            { text: 'SDKs and Libraries', link: '/get-started/sdks-libraries' },
            { text: 'Webhooks', link: '/get-started/webhooks' }
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
            { text: 'Payments', link: '/api-reference/payments' }
          ]
        }
      ],
      '/testing/': [
        {
          text: 'Testing & Tools',
          items: [
            { text: 'Overview', link: '/testing/' },
            { text: 'Postman Setup', link: '/testing/postman-setup' },
            { text: 'API Testing Tools', link: '/testing/api-testing-tools' },
            { text: 'Troubleshooting', link: '/testing/troubleshooting' }
          ]
        }
      ],
      '/contribution/': [
        {
          text: 'Contribution',
          items: [
            { text: 'Guidelines', link: '/contribution/' }        
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

    // Footer (using custom component)
    footer: {
      message: '',
      copyright: ''
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
