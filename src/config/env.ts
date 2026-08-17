/**
 * Application environment configuration
 * Uses import.meta.env provided by Vite for type-safe environment variables
 */

export const env = {
  api: {
    url: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws',
    key: import.meta.env.VITE_API_KEY || '',
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'TradeSetup',
    environment: import.meta.env.VITE_APP_ENV || 'development',
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
  },
} as const;

export default env;
