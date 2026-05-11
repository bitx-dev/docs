/**
 * BITXpay API Endpoints Configuration
 * 
 * Centralized configuration for all API endpoints used throughout the documentation.
 * Update these values in one place to reflect changes across all documentation files.
 */

export const API_ENDPOINTS = {
  // Sandbox Environment
  sandbox: {
    baseUrl: 'https://sandboxapi.bitxpay.com/api/v1',
    description: 'Sandbox environment for testing and development',
  },

  // Production Environment
  production: {
    baseUrl: 'https://api.bitxpay.com/api/v1',
    description: 'Production environment for live transactions',
  },

  // Specific Endpoints
  endpoints: {
    // Payment Links
    paymentLinks: '/payment_links',
    currencies: '/currencies',
    
    // Subscriptions
    subscriptions: '/public/subscriptions/link',
    subscribers: '/public/subscriber',
    
    // Webhooks
    webhookEndpoints: '/webhook-endpoints',
    
    // Account
    account: '/account',
    payments: '/payments',
  },
};

/**
 * Helper function to build full API URLs
 * 
 * @param environment - 'sandbox' or 'production'
 * @param endpoint - endpoint path from API_ENDPOINTS.endpoints
 * @returns Full API URL
 * 
 * @example
 * getApiUrl('sandbox', 'paymentLinks')
 * // Returns: https://sandboxapi.bitxpay.com/api/v1/payment_links
 */
export function getApiUrl(
  environment: 'sandbox' | 'production',
  endpoint: keyof typeof API_ENDPOINTS.endpoints
): string {
  const baseUrl = API_ENDPOINTS[environment].baseUrl;
  const endpointPath = API_ENDPOINTS.endpoints[endpoint];
  return `${baseUrl}${endpointPath}`;
}

/**
 * Get base URL for an environment
 * 
 * @param environment - 'sandbox' or 'production'
 * @returns Base API URL
 */
export function getBaseUrl(environment: 'sandbox' | 'production'): string {
  return API_ENDPOINTS[environment].baseUrl;
}

/**
 * Get all endpoints for documentation
 * @returns Object with all configured endpoints
 */
export function getAllEndpoints() {
  return API_ENDPOINTS.endpoints;
}
