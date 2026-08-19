# TradeSetup: Institutional Trading Dashboard

TradeSetup is a 6-step institutional-grade dashboard designed to enforce a disciplined, top-down approach to trading. It bridges the gap between macroeconomic analysis and precise execution, ensuring that every trade is backed by data, institutional positioning, and strict risk management.

This methodology is deeply rooted in the analytical frameworks found in our `brain/` knowledge base, including the *Global Macro Framework*, *COT Insider Intelligence*, *Algorithmic Strategy Framework*, and *Volume Spread Analysis*.

---

## 🧭 Dashboard Overview: The 6-Step Process

The dashboard is structured into six consecutive panels. A trader must pass through each step sequentially to form a valid, high-probability trade setup.

### 1. Macro Regime (`/`)
**Purpose:** Determine the global macroeconomic bias before looking at any charts. "Without this context, price action is noise; with it, price action becomes a signal of market efficiency" (*Global Macro Framework*).
*   **Fed Funds Rate:** Tracks the central bank's policy rate cycle (Hike, Cut, Hold).
*   **10Y-2Y Yield Spread:** A critical fixed-income signal for recession risk (Inverted vs. Normal).
*   **CPI Inflation:** Measures whether inflation is moving toward the Fed's 2% target, impacting USD strength.
*   **Gold vs. DXY Correlation:** Intermarket analysis to validate true institutional flows. A falling DXY alongside rising Gold confirms genuine risk-on or safe-haven demand.

### 2. COT Intelligence (`/cot`)
**Purpose:** Track the "smart money" to ensure you are trading alongside institutions, not against them.
*   **Non-Commercial Net Positioning:** Shows whether Hedge Funds (speculators) are net long or net short.
*   **Commercial Positioning:** Shows the hedging activity of producers/dealers. 
*   **COT Index (52-week percentile):** Measures how extreme current positioning is compared to the past year. Readings > 80% or < 20% often signal overcrowded trades prone to reversal (*Leveraging COT Insider Intelligence*).

### 3. Market Structure (`/structure`)
**Purpose:** Verify multi-timeframe (MTF) trend alignment. The higher timeframe always dictates the dominant flow.
*   **Alignment Score:** Checks if Monthly, Weekly, Daily, H4, and H1 timeframes are in sync (e.g., all showing Bullish Break of Structure - BOS).
*   **Liquidity Targets:** Identifies Magnet Zones (Buy-Side/Sell-Side Liquidity) where price will likely gravitate to clear stop losses.

### 4. Price Action (`/price-action`)
**Purpose:** Pinpoint high-probability entries using Smart Money Concepts (SMC) and Order Flow.
*   **Scanned Setups:** Ranks identified setups by tier (A+ to B).
*   **SMC Patterns:** Looks for Fair Value Gaps (FVG), Order Blocks (OB), and Change of Character (ChoCH) to find optimal entry points with tight invalidation levels.

### 5. Algo Metrics (`/algo`)
**Purpose:** Measure current volatility and assess mathematical "fair value" to prevent buying at overbought extremes or setting stops too tight.
*   **ATR Volatility Gauge:** Average True Range (14-period). Measures the expected daily swing. "Higher ATR necessitates a smaller position size to keep the dollar-risk constant" (*Global Macro Framework*).
*   **VWAP Standard Deviation Bands:** Volume-Weighted Average Price. Represents the true institutional average price. Prices hitting +2σ are mathematically expensive (Overbought), while -2σ are cheap (Oversold) (*Algorithmic Strategy Framework*).

### 6. Risk Gate (`/risk`)
**Purpose:** The final, emotionless checkpoint. Calculates exact position sizing and enforces rules to ensure capital preservation.
*   **Position Size Calculator:** Computes exact Lot Size based on Account Balance, Risk %, Entry, and Stop Loss distance.
*   **Pre-Trade Checklist:** Automatically blocks the trade if parameters are violated (e.g., Risk:Reward is less than 1:2.5, or risk per trade exceeds 2%).

---

## 🧠 Core Trading Philosophy

1. **Capital Preservation First:** The primary objective is not the pursuit of profit, but the rigorous management of what we stand to lose.
2. **Top-Down Alignment:** Never take a technical setup (Step 4) that contradicts the Macro Regime (Step 1) or Institutional Positioning (Step 2).
3. **Volatility-Adjusted Risk:** Static lot sizes are dangerous. Position sizes must dynamically adapt to ATR and exact Stop Loss distance (Step 5 & 6).
4. **Data-Driven Objectivity:** By moving from subjective chart reading to data-backed checkpoints (FRED, CFTC, VWAP), we eliminate cognitive biases like anchoring and confirmation bias.
