# Focus Dev Service on XAUUSD, BTCUSD, USOUSD (3 Triggers Performance Optimization)

> **Objective**: Streamline the dev service and trading dashboard to focus strictly on the trader's 3 primary core assets — **XAUUSD (Gold)**, **BTCUSD (Bitcoin)**, and **USOUSD (WTI Crude Oil)** — eliminating unnecessary background fetches, multi-pair forex polling, and unneeded subscriptions to dramatically reduce loading time and memory overhead.

---

## 1. Problem Analysis & Bottlenecks

1. **Unnecessary Startup Loading**:
   - `DEFAULT_WS_SYMBOLS` currently requests `['GC=F', 'EURUSD=X', 'GBPUSD=X', 'GBPJPY=X', 'ES=F']`.
   - `LiveMarketProvider` triggers `bootstrapSymbolHistory` for all 5 symbols on initial mount, causing 5 heavy historical bar fetches before the user even clicks anything.
   - `Finnhub` tries to connect to 9 forex/equity streams that are never used by the primary trading strategy.
2. **Scanner Overhead**:
   - `setupScanner.ts` currently scans `GC=F`, `EURUSD=X`, and `GBPJPY=X`.
   - `useTradeSetups()` runs on initial load in `Header.tsx` (top-level), loading bars for unrelated forex pairs instead of the trader's 3 core setups.
3. **Missing High-Performance Crypto / Binance Integration for BTCUSD**:
   - `binanceRestApi.ts` and `binance.ts` only handle `XAUUSDT`.
   - `BTCUSD` was routed to Yahoo Finance (slow, rate-limited), when Binance Futures provides <50ms zero-auth public klines and real-time miniTickers for `BTCUSDT`.
4. **UI Decoupling across Panels**:
   - `StructurePanel.tsx` is hardcoded to `GC=F` only.
   - `RiskPanel.tsx` only has contract calculations for Gold.
   - `AlgoPanel.tsx` has tabs for Gold, DXY, and S&P 500 instead of the 3 focus triggers.
   - `Header.tsx` only tracks Gold in the live ticker bar.

---

## 2. Target Architecture: The 3-Trigger Matrix

| Trigger Asset | Canonical Symbol | Alias / Input | Data Source (Quotes & Ticks) | Data Source (Historical Bars) | Contract Sizing Unit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Gold** | `GC=F` | `XAUUSD` | Binance WS (`xauusdt@miniTicker`) | Binance REST (`XAUUSDT` klines) | 100 oz / lot ($1/pt) |
| **Bitcoin** | `BTC-USD` | `BTCUSD`, `BTCUSDT` | Binance WS (`btcusdt@miniTicker`) | Binance REST (`BTCUSDT` klines) | 1 BTC / lot ($1/pt) |
| **Crude Oil** | `CL=F` | `USOUSD`, `USOIL` | Cached Fast REST (Yahoo `CL=F`) | Yahoo Finance Chart (`CL=F`) | 1,000 bbl / lot ($10/pt) |

---

## 3. Detailed Technical Action Plan

### Phase 1: Symbol Normalization & Fast Binance Routing
- **`src/services/websocket/symbolMap.ts`**:
  - Add `BTC-USD` to `BINANCE_STREAMS` (`btcusdt@miniTicker`).
  - Set `DEFAULT_WS_SYMBOLS` to `['GC=F', 'BTC-USD', 'CL=F']`.
  - Add `normalizeSymbol(symbol)` to handle `XAUUSD` -> `GC=F`, `BTCUSD` -> `BTC-USD`, `USOUSD` -> `CL=F`.
- **`src/services/websocket/binance.ts`**:
  - Update `STREAM_TO_SYMBOL` with `BTCUSDT: 'BTC-USD'`.
  - Update `createBinanceWsUrl` to support combined streams when multiple symbols are passed:
    `wss://fstream.binance.com/stream?streams=xauusdt@miniTicker/btcusdt@miniTicker`.
  - Update `parseBinanceMessage` to handle both direct and multiplexed `{ stream, data }` payloads.
- **`src/services/websocket/liveMarketHub.ts`**:
  - Connect all Binance symbols at once using the combined stream URL.
- **`src/services/binanceRestApi.ts`**:
  - Support `BTCUSDT` in `fetchBinanceBars` and `isBinanceRestSymbol`.
- **`src/services/marketDataProvider.ts`**:
  - Route both `GC=F` and `BTC-USD` to Binance REST (instant <50ms response, zero rate limit).

### Phase 2: Setup Scanner & Background Loading Reduction
- **`src/services/setupScanner.ts`**:
  - Update `SCAN_SYMBOLS` to the 3 focus triggers:
    1. `{ symbol: 'GC=F', asset: 'XAU/USD (Gold)' }`
    2. `{ symbol: 'BTC-USD', asset: 'BTC/USD (Bitcoin)' }`
    3. `{ symbol: 'CL=F', asset: 'USO/USD (Crude Oil)' }`
  - Remove all forex scanning.
- **`src/context/LiveMarketProvider.tsx`**:
  - Only bootstrap the 3 focus symbols (`GC=F`, `BTC-USD`, `CL=F`).
  - Drop Finnhub forex proxies unless explicitly needed.

### Phase 3: Dashboard UI Alignment (Panels & Header)
- **`src/components/layout/Header.tsx`**:
  - Add live ticker chips for all 3 triggers: **XAU/USD**, **BTC/USD**, and **USO/USD** with live status indicator.
- **`src/pages/PriceActionPanel.tsx`**:
  - Update description to reflect live scan of the 3 focus triggers (Gold, Bitcoin, Crude Oil).
- **`src/pages/StructurePanel.tsx`**:
  - Add trigger switcher tabs `[ XAU/USD (Gold) | BTC/USD (Bitcoin) | USO/USD (Crude Oil) ]` so the trader can instantly analyze MTF alignment, liquidity pools (BSL/SSL), and session profile for any of the 3 assets.
- **`src/pages/AlgoPanel.tsx`**:
  - Change tabs to `[ Gold (XAU) | Bitcoin (BTC) | Crude Oil (USO) ]` with appropriate units ($) and thresholds.
- **`src/pages/RiskPanel.tsx`**:
  - Add asset selector dropdown or tabs for the 3 triggers with accurate contract specifications:
    - XAUUSD: 100 oz, $0.01 tick
    - BTCUSD: 1 BTC, $1.00 tick
    - USOUSD: 1,000 bbl, $0.01 tick

---

## 4. Verification & Testing
1. **Unit Tests**:
   - Update `websocket.test.ts` to test Binance combined stream parsing and multi-symbol routing (`XAUUSDT`, `BTCUSDT`).
   - Run `npm test` with Vitest to ensure all tests pass.
2. **Build Verification**:
   - Run `npm run build` (`tsc && vite build`) to ensure 0 TypeScript or bundling errors.
3. **Performance Check**:
   - Confirm network tab requests drop by over 60% on dev startup (no unnecessary forex pair queries, no Finnhub proxy spam).
