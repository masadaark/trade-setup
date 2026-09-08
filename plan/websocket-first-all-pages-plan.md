# Plan: WebSocket-First Across All Pages Architecture [COMPLETED]

> **Objective**: Implement a strict **"WebSocket-First, API On-Demand (Cached)"** architecture across all dashboard pages:
> - **WebSocket (Push)** handles all live prices, trigger states, proximity calculations, and live alerts in memory with **0 HTTP calls**.
> - **API Calls (Pull)** are restricted strictly to one-time historical baseline initialization (OHLCV bars, weekly COT), persistent in L2 `sessionStorage` cache (0ms subsequent loads).

---

## 1. Page-by-Page Implementation Status

| Page | Role | Status | Live WS Real-Time Capabilities |
| :--- | :--- | :---: | :--- |
| **Price Action** (`PriceActionPanel.tsx`) | Step 4 / 5 | ✅ **Completed** | • SetupRow & BestSetupCard connected to `useLivePrice`<br>• Live entry proximity (% and pts) calculated tick-by-tick<br>• Dynamic trigger badges: `🎯 AT ENTRY`, `⚡ APPROACHING`, `⏳ MONITORING`<br>• 0 HTTP calls while monitoring setups |
| **Market Structure** (`StructurePanel.tsx`) | Step 3 / 5 | ✅ **Completed** | • Connected to `useLivePrice(selectedSymbol)`<br>• Live POI banner: `🚨 BSL SWEPT (+pts)`, `🏰 INSIDE DEMAND BOX`, `⚡ APPROACHING DEMAND`<br>• Live Asian Session Range & London IB breakout detection<br>• Live tick indicator with green pulse & WS badge |
| **Algo Metrics** (`AlgoPanel.tsx`) | Step 5 / 5 | ✅ **Completed** | • Connected to `useLivePrice(symbol)`<br>• Real-time in-memory VWAP deviation (`vwapDev`) & points delta<br>• Live VWAP standard deviation bands status: Overbought / Oversold / Fair Value<br>• Dynamic ATR stop-loss sizing (1.0×, 1.5×, 2.0× ATR)<br>• 0 HTTP calls while tracking volatility |
| **Macro Regime** (`MacroPanel.tsx`) | Step 1 / 5 | ✅ **Completed** | • Real-time Gold & Bitcoin ticks feed intermarket macro bias<br>• WS Intermarket Real-Time indicator badge<br>• FRED economic indicators & currency strength cached in L2 (0 redundant fetches) |
| **COT Intelligence** (`CotPanel.tsx`) | Step 2 / 5 | ✅ **Completed** | • Connected to `useLivePrice` for selected asset (`GC=F`, `CL=F`, `EURUSD=X`, `GBPUSD=X`, `ES=F`)<br>• Real-time spot price ticker and % change in header<br>• New 4th column: **Spot vs COT Alignment** combining weekly institutional positioning with live spot price momentum |

---

## 2. Core Service Optimizations

- **`marketDataRouter.ts`**:
  - Enforces WebSocket-first: quotes return live WebSocket quote instantly if covered, with 0 REST requests.
  - Bars fetched once and quotes derived in memory (no duplicate 5d/6mo hits).
- **`cache.ts`**:
  - Historical OHLCV cached in L2 `sessionStorage` with 30–60 min TTL so switching pages takes 0 network requests.
- **`setupScanner.ts`**:
  - Hardened with try/catch and memoized in-flight promises.
- **`yahooFinanceApi.ts`**:
  - Safe fallback baseline generator prevents UI crashes if Yahoo rate-limits (HTTP 429).
- **`websocket/symbolMap.ts`**:
  - WS stream symbols restricted to `GC=F` (Binance `XAUUSDT`) and `BTC-USD` (Binance `BTCUSDT`) for 100% free, high-speed streaming.

---

## 3. Verification Results

- **Unit Tests**: 10/10 passed (`npm test` in 444ms).
- **Production Build**: 0 errors (`npm run build` in 1.69s).
- **Network Performance**: 0 HTTP requests fired while streaming real-time prices on any dashboard page.

---

## 4. Gold Spot (`GC=F`) Initial Load Bug Fix

### Root Cause Analysis
1. **Inactive Binance Futures Stream**: `xauusdt@miniTicker` on `fstream.binance.com` sent no public ticks (restricted/dropped by Binance Futures).
2. **Delayed Fallback**: `useLivePrice` waited 5,000ms for WS before falling back to REST; during this window `quote` remained `null`.
3. **Missing Header Placeholder**: `HeaderTickerItem` in `Header.tsx` returned `null` when `price == null`, causing the Gold Spot ticker to completely vanish from the header on first load.
4. **Missing Aggregator Notification**: `seedFromBars` in `priceAggregator.ts` updated internal state but never called `emitQuote`, leaving initial subscribers unnotified until a tick arrived.

### Resolutions Applied
1. **Switched to Binance Spot `PAXGUSDT`**: Mapped `GC=F` to `paxgusdt@miniTicker` via `wss://stream.binance.com:9443/stream?streams=paxgusdt@miniTicker/btcusdt@miniTicker`. Ticks arrive in under 50ms without authentication or geo-restrictions.
2. **L2 `sessionStorage` Quote Cache in `priceAggregator`**: Latest quotes are persisted to and read from `sessionStorage` on startup for instantaneous 0ms price availability.
3. **Emit on Seed**: `seedFromBars` now immediately notifies subscribers via `emitQuote`.
4. **Fast 1.5s Fallback & Graceful UI Placeholders**: Reduced REST fallback timeout from 5.0s to 1.5s, and added pulsing `Connecting…` placeholders in `Header.tsx` and `StructurePanel.tsx` so the UI never flickers or vanishes.
