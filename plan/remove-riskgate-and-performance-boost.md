# Plan: Remove Risk Gate Page & High-Performance Real-Time Data Pipeline

> **Objective**: 
> 1. Completely remove the unused **Risk Gate** page (`RiskPanel.tsx`, routes, and navigation).
> 2. Re-engineer data fetching pipelines to dramatically accelerate data download speeds (0ms local cache, parallel fetching, isolated provider queues) while preserving 100% real-time WebSocket price updates.

---

## 1. Performance Diagnostics: What is Slowing Down Data?

1. **Global Queue Throttling Serialized All Providers**:
   - `src/services/requestQueue.ts` used a single global `chain` and `lastCallAt` timestamp.
   - When Yahoo Finance requested data (with a 2,000ms delay), fast providers like Binance (<50ms) and Frankfurter (<100ms) were forced to wait in the same queue!
2. **In-Memory-Only Cache (Frequent Refetches on Refresh/Dev)**:
   - `src/services/cache.ts` only stored data in a JavaScript `Map`.
   - Every browser reload or Vite dev server HMR event forced the app to re-download all historical charts from scratch.
3. **Waterfall / Sequential Data Fetching**:
   - `useStructureAnalysis` in `src/hooks/useMarketData.ts` looped over 6 timeframes (`MN, W1, D1, H4, H1, M15`) sequentially (`for (const cfg of MTF_CONFIG)`).
   - `useCurrencyStrength` looped over 7 currency pairs sequentially.
4. **Header Over-Fetching**:
   - `src/components/layout/Header.tsx` loaded on every route, triggering `useTradeSetups()`, `useLivePrice('DX-Y.NYB')` (which fell through to Yahoo Finance REST), and `useFredSeries('fedFunds')`.
5. **Unused Risk Gate Overhead**:
   - `RiskPanel.tsx` mounted additional setups, calculations, and icons that the user never uses.

---

## 2. Target Architecture & Improvements

### A. Remove Risk Gate Page
- Delete `src/pages/RiskPanel.tsx`.
- Remove `/risk` route from `src/App.tsx`.
- Remove `Risk Gate` item from `src/components/layout/Sidebar.tsx`.
- Update workflow step labels on remaining pages from "Step X of 6" to "Step X of 5".

### B. High-Speed Isolated Request Queues (`requestQueue.ts`)
- Separate queues per provider (`binance`, `yahoo`, `frankfurter`, `fred`, etc.).
- Allow Binance to run with 0 artificial throttle (up to 1,200 req/min permitted by Binance public API).
- Keep Yahoo rate-limit protections isolated to Yahoo requests only.

### C. Tiered L1/L2 Persistent Caching (`cache.ts`)
- Implement L1 (In-Memory `Map`) + L2 (`sessionStorage`) cache with TTL.
- Historical bars for Gold, Bitcoin, and Oil (which don't change every second) are stored in `sessionStorage` (30 min - 2 hr TTL).
- Page reloads and panel switches load data in **0ms** from storage!
- In-flight request deduplication prevents duplicate simultaneous fetches for the same symbol/timeframe.

### D. Parallel Asynchronous Fetching
- Rewrite `useStructureAnalysis` to fetch all 6 timeframes concurrently using `Promise.all()`.
- Rewrite `useCurrencyStrength` to fetch currency pairs in parallel.

### E. Optimize Header Data Footprint
- Remove non-WS DXY and FRED network queries from `Header.tsx`.
- Derive market direction from the 3 real-time trigger assets (Gold, Bitcoin, Oil) which already stream via WebSocket and fast cache.

### F. Preserve 100% Real-Time Live Updates
- Binance WebSocket stream (`fstream.binance.com/stream?streams=xauusdt@miniTicker/btcusdt@miniTicker`) continues to push instant tick updates to `priceAggregator`.
- Real-time ticks continuously overlay the latest bar and update live prices at 60 FPS.

---

## 3. Implementation Steps

1. **Delete & Clean Up Risk Gate**:
   - Remove `src/pages/RiskPanel.tsx`.
   - Update `src/App.tsx` and `src/components/layout/Sidebar.tsx`.
   - Adjust step counters in remaining pages.
2. **Upgrade `requestQueue.ts`**:
   - Isolate queues per provider so fast providers execute immediately.
3. **Upgrade `cache.ts`**:
   - Add safe `sessionStorage` L2 persistence with TTL and error fallback.
4. **Parallelize Hook Data Loading**:
   - Update `useStructureAnalysis` and `useCurrencyStrength` to use `Promise.all`.
5. **Streamline `Header.tsx`**:
   - Remove unnecessary network calls and make header lightweight and instantaneous.
6. **Verify Build & Tests**:
   - Run `npm test` and `npm run build`.
