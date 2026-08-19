/**
 * Application environment configuration
 * Uses import.meta.env provided by Vite for type-safe environment variables
 */

export const env = {
  // Internal Backend API (ถ้ามี)
  api: {
    url: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws',
  },

  // 3rd Party Services (อ้างอิงตาม Data Source Matrix)
  thirdParty: {
    // DS-1: Yahoo Finance (Unofficial REST) - ไม่ต้องใช้ API Key
    yahooFinance: {
      baseUrl: 'https://query1.finance.yahoo.com/v8/finance/chart',
    },
    // DS-2: FRED (Federal Reserve Economic Data)
    fred: {
      baseUrl: 'https://api.stlouisfed.org/fred',
      apiKey: import.meta.env.VITE_FRED_API_KEY || '',
    },
    // DS-3: CFTC COT Reports (ผ่าน Quandl/Nasdaq Data Link)
    quandl: {
      baseUrl: 'https://data.nasdaq.com/api/v3',
      apiKey: import.meta.env.VITE_QUANDL_API_KEY || '64uLnCBbSq3xFwjyFfQ6',
    },
    // DS-4: Alpha Vantage (Fallback)
    alphaVantage: {
      baseUrl: 'https://www.alphavantage.co/query',
      apiKey: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || '176Y8LNVYLYKAA9K',
    }
  },

  app: {
    name: import.meta.env.VITE_APP_NAME || 'TradeSetup',
    environment: import.meta.env.VITE_APP_ENV || 'development',
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
  },
} as const;

export default env;
