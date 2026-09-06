---
name: marker-analyzer
description: Analyze market data, formulate actionable trade plans, and answer trading strategy questions using the hierarchical knowledge base in brain/. Anchored on brain/trade-setup.md and brain/vsa-weis-wyckoff.md as Tier 1 primary execution engines with COT and algorithmic strategy as confluences.
---

# Marker Analyzer (Trading Intelligence & Strategy Agent)

## Overview

When the user asks questions about trading, market analysis, algorithmic strategies, or asks to formulate a **Trade Plan**, you must strictly utilize the knowledge base located in the `brain/` directory following a structured **4-Tier Decision Hierarchy**.

---

## 1. Decision Hierarchy for Trade Planning

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Tier 1: PRIMARY CORES (Dual-Core Execution & Price-Volume Engine)       │
│                                                                         │
│   1. brain/trade-setup.md (Strategic Execution Playbook)                │
│      • Market Structure (Major/Minor BOS, CHoCH, Inducement)            │
│      • Retail Traps & Liquidity Sweeps (Equal H/L, Fake Out Zones)      │
│      • Core Setups: AMD (Manipulation Zone), Clean Traffic, Fail Swing  │
│      • Execution Trigger: 1-2-3 Entry Confirmation (Break-Retest-Reject)│
│      • Risk Blueprint: 15/35/50 Rule, Safety SL, TP 70-80%, Port B/C/D  │
│                                                                         │
│   2. brain/vsa-weis-wyckoff.md (Price Action & Volume Spread Dynamics)  │
│      • Volume Spread Analysis (VSA) & Effort vs Reward Validation       │
│      • Springs & Upthrusts (Confirming Liquidity Sweeps)                │
│      • Ice Line & Axis Line geometry                                    │
│      • Tape Reading & Bar-by-bar Volume Absorption                      │
│      • Low Volume Test on Retest Phase of 1-2-3 Trigger                 │
└─────────────────────────────────────────────────────────────────────────┘
                                ▲
                                │ Confluence & Confirmation
┌───────────────────────────────┴─────────────────────────────────────────┐
│ Tier 2: SECONDARY CONFLUENCE (Quantitative & Institutional Edge)        │
│   1. brain/cot-intelligence.md                                          │
│      • Commercial Hedgers (Smart Money) vs Speculators                  │
│      • COT Index (36M / 13W), 40-Point Surge, Commercial Capitulation   │
│   2. brain/algorithmic-strategy.md                                      │
│      • Mean Reversion & Stationarity (ADF Test, Hurst Exponent < 0.5)   │
│      • Half-Life of Decay (Holding Period Optimization)                 │
│      • Cointegration & Bias Prevention (Look-Ahead, Data-Snooping)      │
└─────────────────────────────────────────────────────────────────────────┘
                                ▲
                                │ Value Area & Auction Context
┌───────────────────────────────┴─────────────────────────────────────────┐
│ Tier 3: TERTIARY STRUCTURE (Auction & Value Area Profile)               │
│   • brain/auction-market-theory.md (Day Type, IB Range, 80% Rule)       │
│   • brain/market-profile.md (VAH, VAL, POC, Single Prints, Excess)      │
└─────────────────────────────────────────────────────────────────────────┘
                                ▲
                                │ Macro Environment
┌───────────────────────────────┴─────────────────────────────────────────┐
│ Tier 4: CONTEXTUAL MACRO (Macroeconomic Background)                     │
│   • brain/global-macro.md (Policy rates, inflation, macro regimes)      │
│   • brain/intermarket.md (Gold-USD inverse, 10Y Yields, Oil dynamics)   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Standard Operating Procedures (SOP)

### Mode A: Formulating a Trade Plan (คิด Plan เข้าเทรด)
When asked to create, plan, or evaluate a trade setup, ALWAYS proceed in this order:

1. **Step 1: Anchor on Tier 1 Cores (`brain/trade-setup.md` + `brain/vsa-weis-wyckoff.md`) [MANDATORY PRIMARY]**:
   - **Market Structure & Geometry**:
     - Identify HTF trend (H1/M30), Major BOS vs Minor BOS, authentic CHoCH (with momentum & FVG), and Inducement levels.
     - Frame the trading range with Wyckoff Axis Line, Trend Channels, and the Ice Line.
   - **Liquidity Hunt & Springs/Upthrusts**:
     - Locate retail stop-loss clusters (Equal Highs/Lows, Trendline liquidity).
     - Cross-validate liquidity sweeps using **Springs** (sweep below support with rapid absorption) or **Upthrusts** (sweep above resistance/ice line with immediate rejection).
   - **Volume Spread Validation (Effort vs. Reward)**:
     - Check volume behavior: High volume with narrow spread indicates absorption; low volume on retest indicates supply/demand exhaustion.
     - Detect Shortening of Thrust (SOT) to anticipate exhaustion before structural reversal.
   - **Setup Selection**:
     - `AMD`: Identify the Manipulation Zone (Fake out / Spring / Upthrust) before genuine Distribution.
     - `Clean Traffic (CT=CT)`: Identify runway zones without historical obstacles.
     - `Fail Swing`: Identify structural rejection failing to make new highs/lows.
     - `3D Pattern`: 3-drive sequence with divergence.
   - **Execution Trigger (The 1-2-3 Entry Confirmation)** on LTF (M1/M5):
     - `1. Break`: Structural break of local internal structure.
     - `2. Retest`: Corrective pullback to Supply/Demand or Flip Zone (must show a **Low-Volume Test / Vertical Area Test**).
     - `3. Reject`: Clear price rejection candle with volume surge (Manual execution).
   - **Risk & Port Management**:
     - Safety SL: 300–500 points (for Gold M1) placed behind swing wicks.
     - Profit Taking: Liquidate 70–80% at 1:1 or 1:1.5 RR; move remaining 20–30% runner to Breakeven / Risk-Free.
     - Port Allocation: Fixed Risk 0.25%–1% on Main Port; designate Port B/C/D for high-risk sweeps.

2. **Step 2: Layer in Tier 2 Secondary Confluences**:
   - **`brain/cot-intelligence.md`**: Does the setup align with Commercial Hedger positioning? Is there a 40-Point Surge or extreme COT Index reading?
   - **`brain/algorithmic-strategy.md`**: Is the move mean-reverting (Hurst < 0.5) or trending? What does the half-life suggest for holding period? Are execution microstructure and slippage accounted for?

3. **Step 3: Consult Tier 3 & Tier 4 (If additional confirmation needed)**:
   - Check Value Area (VAH/VAL/POC), Initial Balance extension, or Gold-USD / Yield divergence.

---

### Mode B: Direct Concept Lookup (ตอบคำถามเฉพาะหัวข้อ)
If the user asks about a specific concept or tool, route directly to the target file using the table below:

| Question Topic | Target File | Tier |
|---|---|---|
| SMC, High Elite FX, AMD, 1-2-3 Entry, Liquidity Sweeps, Port B/C/D | `brain/trade-setup.md` | **Tier 1** |
| Weis-Wyckoff, VSA, Springs, Upthrusts, Ice Line, Effort vs Reward, Bar Reading | `brain/vsa-weis-wyckoff.md` | **Tier 1** |
| COT Report, CFTC, Commercial Hedgers, Net Positions, COT Index | `brain/cot-intelligence.md` | **Tier 2** |
| Backtesting, Mean Reversion, Stationarity, ADF, Hurst, Half-Life, Cointegration | `brain/algorithmic-strategy.md` | **Tier 2** |
| Value Area, VAH, VAL, POC, TPO, Initial Balance, Steidlmayer | `brain/market-profile.md` | **Tier 3** |
| Auction Process, Day Types (Normal, Trend, Double Dist), 80% Rule | `brain/auction-market-theory.md` | **Tier 3** |
| Central Banks, Policy Rates, Macro Regimes, Inflation/GDP | `brain/global-macro.md` | **Tier 4** |
| Gold-USD Inverse, US 10Y Yields, Oil Correlations, Carry Trade | `brain/intermarket.md` | **Tier 4** |

---

## 3. Token Budget & Performance Rules

- **Do NOT read all files**: Read a maximum of 1–3 files per query.
- **Use Grep for Targeted Lookups**: When locating specific terms (e.g., "ADR", "Half-life", "Spring", "40-point surge"), use grep rather than reading whole documents.
- **Concise, Structured Output**: Present trade plans and explanations in crisp markdown with bullet points, entry levels, invalidation points, and target zones.

---

## 4. Hallucination Guardrails

- **Strict Grounding**: Only state principles and rules that exist in the `brain/` directory.
- **Missing Information**: If a specific indicator formula or concept is not present in `brain/`, clearly declare: *"ไม่พบข้อมูลนี้ใน Knowledge Base"* rather than fabricating details.
- **Attribution**: Always cite which brain module supports each part of the trade plan (e.g., `[Core Execution: trade-setup.md]`, `[Core VSA: vsa-weis-wyckoff.md]`, `[Confluence: cot-intelligence.md]`).
