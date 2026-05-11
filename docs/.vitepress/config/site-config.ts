/**
 * BITXpay Site Configuration
 * 
 * Centralized configuration for site-wide constants and URLs.
 * Update these values in one place to reflect changes across all configuration files.
 */

export const SITE_CONFIG = {
  // Site metadata
  title: 'BITXpay',
  description: 'Official API documentation for BITXpay - Cryptocurrency Payment Gateway',
  
  // Site URLs
  urls: {
    // Main documentation site
    docs: 'https://bitx-dev.github.io/docs/',
    
    // API Server URLs (for examples and responses)
    apiServer: {
      development: 'http://localhost:3000',
      sandbox: 'https://api-sandbox.bitxpay.com',
      production: 'https://api.bitxpay.com',
    },
    
    // Sandbox environment
    sandbox: 'https://sandbox.bitxpay.com',
    
    // Production environment
    production: 'https://bitxpay.com',
    
    // Social and support
    discord: 'https://discord.gg/bitxpay',
    email: 'support@bitxpay.com',
    github: 'https://github.com/bitxpay',
    
    // Support and status
    support: {
      email: 'api-support@bitxpay.com',
      documentation: 'https://bitx-dev.github.io/docs/',
      statusPage: 'https://status.bitxpay.com',
    },
  },

  // SEO configuration
  seo: {
    hostname: 'https://bitx-dev.github.io/docs/',
    ogImage: 'https://bitx-dev.github.io/docs/og-image.png',
    twitterHandle: '@bitxpay',
  },

  // Theme configuration
  theme: {
    primaryColor: '#3b82f6',
    logo: '/logo.svg',
    appleIcon: '/apple-touch-icon.png',
  },

  // Fonts
  fonts: {
    google: {
      family: 'Inter',
      weights: [400, 500, 600, 700, 800],
      url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
    },
  },

  // Base path configuration
  basePath: {
    development: '/',
    production: '/docs/',
  },

  // Feature flags
  features: {
    sitemap: true,
    cleanUrls: true,
    darkMode: false,
  },
};

/**
 * Helper function to get base path based on environment
 * @returns Base path for current environment
 */
export function getBasePath(): string {
  return process.env.NODE_ENV === 'production' 
    ? SITE_CONFIG.basePath.production 
    : SITE_CONFIG.basePath.development;
}

/**
 * Helper function to get full URL
 * @param path - Path to append to docs URL
 * @returns Full URL
 */
export function getFullUrl(path: string = ''): string {
  const base = SITE_CONFIG.urls.docs;
  return path ? `${base}${path}` : base;
}

/**
 * Helper function to get API server URL
 * @param environment - 'development', 'sandbox', or 'production'
 * @returns API server URL
 */
export function getApiServerUrl(environment: 'development' | 'sandbox' | 'production'): string {
  return SITE_CONFIG.urls.apiServer[environment];
}

/**
 * Helper function to get support URL
 * @param type - 'email', 'documentation', or 'statusPage'
 * @returns Support URL or email
 */
export function getSupportUrl(type: 'email' | 'documentation' | 'statusPage'): string {
  return SITE_CONFIG.urls.support[type];
}

/**
 * Helper function to get site URL (excluding apiServer and support)
 * @param key - Key from urls object
 * @returns URL value
 */
export function getSiteUrl(key: Exclude<keyof typeof SITE_CONFIG.urls, 'apiServer' | 'support'>): string {
  return SITE_CONFIG.urls[key] as string;
}
