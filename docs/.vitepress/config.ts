import { defineConfig } from 'vitepress'
import apiEndpointsPlugin from './plugins/api-endpoints-plugin'
import { SITE_CONFIG, getBasePath } from './config/site-config'
import { API_ENDPOINTS } from './config/api-endpoints'

// Resolve a dotted path (e.g. "sandbox.baseUrl") against a source object.
function resolvePath(source: Record<string, any>, path: string): string {
  const value = path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), source)
  return value == null ? `{{ MISSING:${path} }}` : String(value)
}

// Build-time replacement of {{ $api.* }} / {{ $site.* }} template variables.
// Vue's runtime {{ }} interpolation does not work inside Shiki-highlighted
// fenced code blocks (the highlighter splits "{{ expr }}" into separate
// spans), so we substitute these tokens directly in the raw markdown source
// before it is tokenized/highlighted. This guarantees correct rendering
// everywhere: prose, inline code, and fenced code blocks alike.
function apiVarsMarkdownPlugin(md: any) {
  md.core.ruler.before('normalize', 'bitxpay_api_vars', (state: any) => {
    state.src = state.src
      .replace(/\{\{\s*\$api\.([\w.]+)\s*\}\}/g, (_: string, path: string) =>
        resolvePath(API_ENDPOINTS, path)
      )
      .replace(/\{\{\s*\$site\.([\w.]+)\s*\}\}/g, (_: string, path: string) =>
        resolvePath(SITE_CONFIG, path)
      )
  })
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: SITE_CONFIG.title,
  description: SITE_CONFIG.description,

  // Base path: root for both local dev and production (custom domain docs.bitxpay.com)
  base: getBasePath(),

  // Clean URLs without .html extension
  cleanUrls: SITE_CONFIG.features.cleanUrls,

  // Enable git-based "last updated" timestamps (required for themeConfig.lastUpdated to render)
  lastUpdated: true,

  // SEO: Generate sitemap
  sitemap: {
    hostname: SITE_CONFIG.seo.hostname
  },

  // Head tags for SEO
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: SITE_CONFIG.theme.logo }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: SITE_CONFIG.theme.logo }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: SITE_CONFIG.theme.logo }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: SITE_CONFIG.theme.appleIcon }],
    ['meta', { name: 'theme-color', content: SITE_CONFIG.theme.primaryColor }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: SITE_CONFIG.title + ' Documentation' }],
    ['meta', { property: 'og:image', content: SITE_CONFIG.seo.ogImage }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: SITE_CONFIG.fonts.google.url, rel: 'stylesheet' }]
  ],

  themeConfig: {
    // Site logo
    logo: SITE_CONFIG.theme.logo,

    // Navigation bar
    nav: [
      {
        text: 'Documentation',
        items: [
          { text: 'Get Started', link: '/get-started/' },
          { text: 'API Reference', link: '/api-reference/' },
          { text: 'SDKs & Libraries', link: '/sdks/' },
          { text: 'Integration', link: '/integration/' },
          { text: 'Security', link: '/security/' }
        ]
      },
      {
        text: 'Resources',
        items: [
          // { text: 'SDKs & Libraries', link: '/get-started/sdks-libraries' },
          { text: 'Testing Tools', link: '/testing/' },
          { text: 'Webhooks', link: '/get-started/webhooks' }
        ]
      },
      {
        text: 'Support',
        items: [
          { text: 'Troubleshooting', link: '/testing/troubleshooting' },
          { text: 'Contribute', link: '/contribution/' },
          { text: 'NPM Package', link: 'https://www.npmjs.com/package/kentucky-signer-viem?activeTab=readme' },
          { text: 'Telegram', link: 'https://telegram.me/bitxes' }
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
            // { text: 'SDKs and Libraries', link: '/get-started/sdks-libraries' },
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
            { text: 'Payments', link: '/api-reference/payments' },
            { text: 'Subscriptions', link: '/api-reference/subscriptions' }
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
      ],
      '/sdks/': [
        {
          text: 'SDKs & Libraries',
          items: [
            { text: 'Overview', link: '/sdks/' },
            { text: 'JavaScript / TypeScript SDK', link: '/sdks/javascript-sdk' },
            { text: 'Wallet SDK', link: '/sdks/wallet-sdk' }
          ]
        }
      ]
    },

    // Social links
    socialLinks: [
      { icon: 'github', link: 'https://www.npmjs.com/package/kentucky-signer-viem?activeTab=readme' }
    ],

    // Search configuration (built-in local search)
    search: {
      provider: 'local',
      options: {
        detailedView: true,
        translations: {
          button: {
            buttonText: 'Search docs...',
            buttonAriaLabel: 'Search documentation'
          }
        }
      }
    },

    // Footer (using custom component)
    footer: {
      message: '',
      copyright: ''
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
    },
    config: (md) => {
      md.use(apiVarsMarkdownPlugin)
    }
  }
})
