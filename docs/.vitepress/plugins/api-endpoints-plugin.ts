/**
 * VitePress Plugin for API Endpoints
 * 
 * This plugin injects API endpoint constants into the global scope,
 * making them available in markdown files via {{ $api.sandbox.baseUrl }} syntax
 */

import { App } from 'vue';
import { API_ENDPOINTS, getApiUrl, getBaseUrl } from '../config/api-endpoints';
import { SITE_CONFIG, getFullUrl, getApiServerUrl, getSupportUrl, getSiteUrl } from '../config/site-config';

export default {
  install(app: App) {
    // Make API endpoints available globally in Vue components and markdown
    app.config.globalProperties.$api = {
      // Environment configurations
      sandbox: API_ENDPOINTS.sandbox,
      production: API_ENDPOINTS.production,
      
      // Helper functions
      getUrl: getApiUrl,
      getBaseUrl: getBaseUrl,
      
      // Direct endpoint access
      endpoints: API_ENDPOINTS.endpoints,
    };

    // Make site configuration available globally in Vue components and markdown
    app.config.globalProperties.$site = {
      // Site configuration
      ...SITE_CONFIG,
      
      // Helper functions
      getFullUrl: getFullUrl,
      getApiServerUrl: getApiServerUrl,
      getSupportUrl: getSupportUrl,
      getSiteUrl: getSiteUrl,
    };

    // Also provide as a global variable for use in markdown
    if (typeof window !== 'undefined') {
      (window as any).__BITXPAY_API__ = {
        sandbox: API_ENDPOINTS.sandbox,
        production: API_ENDPOINTS.production,
        endpoints: API_ENDPOINTS.endpoints,
        getUrl: getApiUrl,
        getBaseUrl: getBaseUrl,
      };
      
      (window as any).__BITXPAY_SITE__ = {
        ...SITE_CONFIG,
        getFullUrl: getFullUrl,
        getApiServerUrl: getApiServerUrl,
        getSupportUrl: getSupportUrl,
        getSiteUrl: getSiteUrl,
      };
    }
  },
};
