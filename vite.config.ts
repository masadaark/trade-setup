import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',
    port: 3000,
    proxy: {
      // FRED API proxy (avoids CORS in browser)
      '/api/fred': {
        target: 'https://api.stlouisfed.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fred/, '/fred'),
      },
      // Binance REST klines (free, no API key — gold history)
      '/api/binance': {
        target: 'https://api.binance.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/binance/, ''),
      },
      // Frankfurter ECB FX rates (free, no API key, no rate limit issues)
      '/api/frankfurter': {
        target: 'https://api.frankfurter.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/frankfurter/, ''),
      },
      // Yahoo Finance proxy — last resort only (aggressive IP rate limits)
      '/api/yahoo': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader(
              'User-Agent',
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            );
          });
        },
      },
      // CFTC Commitments of Traders (free, no API key)
      '/api/cftc': {
        target: 'https://publicreporting.cftc.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cftc/, ''),
      },
      // Alpha Vantage proxy
      '/api/alphavantage': {
        target: 'https://www.alphavantage.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/alphavantage/, ''),
      },
      // Quandl/Nasdaq Data Link proxy
      '/api/quandl': {
        target: 'https://data.nasdaq.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/quandl/, ''),
      },
    },
  },
})

