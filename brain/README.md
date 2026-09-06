# Trading Brain: Master Architecture & Routing Manifest

คู่มือสถาปัตยกรรมคลังสมองความรู้ (Knowledge Base) สำหรับ AI และเทรดเดอร์ เพื่อใช้เป็นลำดับขั้นในการคิด วิเคราะห์ และวางแผนเข้าเทรดอย่างเป็นระบบ มีหลักการ และมีแต้มต่อสูงสุด

---

## 1. Trading Brain Architecture (ลำดับขั้นการตัดสินใจ)

```mermaid
flowchart TD
    subgraph Tier1 ["Tier 1: PRIMARY CORE (แกนหลักในการคิด Plan เข้าเทรด: กลยุทธ์ + พฤติกรรมราคาและโวลุ่ม)"]
        TS["trade-setup.md<br/>• Market Structure (Major/Minor BOS, CHoCH, Inducement)<br/>• Retail Traps & Liquidity Sweeps (Equal H/L, Fake Out)<br/>• Setups: AMD (Manipulation Zone), Clean Traffic, Fail Swing, 3D<br/>• Trigger: 1-2-3 Entry Confirmation (Break-Retest-Reject บน M1/M5)<br/>• Risk & Port Management: กฎ 15/35/50, Safety SL, TP 70-80%, Port B/C/D"]
        VSA["vsa-weis-wyckoff.md<br/>• Volume Spread Analysis (VSA) & Weis-Wyckoff Method<br/>• Effort vs Reward (Volume/Spread divergence)<br/>• Springs, Upthrusts & Vertical Area Tests<br/>• Ice Line & Axis Line geometry<br/>• Bar-by-bar reading & Tape absorption"]
    end

    subgraph Tier2 ["Tier 2: SECONDARY CONFLUENCE (โมดูลเสริมหลัก: สถาบัน & เชิงปริมาณ)"]
        COT["cot-intelligence.md<br/>• Commercial Hedger Positioning (Smart Money)<br/>• COT Index (36M / 13W) & Extreme Sentiment<br/>• 40-Point Surge & Commercial Capitulation"]
        ALGO["algorithmic-strategy.md<br/>• Mean Reversion & Stationarity (ADF, Hurst < 0.5)<br/>• Half-Life of Decay (Holding Period Efficiency)<br/>• Cointegration & Statistical Arbitrage<br/>• Bias Prevention & Execution Microstructure"]
    end

    subgraph Tier3 ["Tier 3: TERTIARY STRUCTURE (โมดูลรอง: โครงสร้างการประมูลและมูลค่าราคา)"]
        AMT["auction-market-theory.md<br/>Day Types, IB Range, 80% Rule, Open Types"]
        MP["market-profile.md<br/>Value Area (VAH/VAL/POC), Single Prints, Excess"]
    end

    subgraph Tier4 ["Tier 4: CONTEXTUAL MACRO (โมดูลบริบทภาพรวมตลาด)"]
        GM["global-macro.md<br/>Central Bank Rates, GDP/CPI, Risk Regimes"]
        IM["intermarket.md<br/>Gold-USD Inversion, 10Y Yields, Oil Dynamics"]
    end

    Tier4 -.->|Macro Background| Tier2
    Tier2 ==>|Validate Smart Money & Statistical Edge| Tier1
    Tier3 -->|Identify Value Area & Auction Context| Tier1
    TS <-->|Dual-Core Synergy: Structure + Volume/Springs| VSA
    Tier1 ==> TRADE_PLAN["🎯 ACTIONABLE TRADE PLAN<br/>Bias + POI + Liquidity Sweep (Spring/Upthrust) + VSA Confirmation + 1-2-3 Trigger + SL/TP + Port Allocation"]
```

---

## 2. Standard Operating Procedure (SOP): ขั้นตอนการคิด Plan เข้าเทรด

เมื่อได้รับคำสั่งให้วิเคราะห์ตลาดหรือจัดทำแผนเข้าเทรด AI ต้องคิดตามลำดับขั้น 4 ขั้นตอนนี้เสมอ:

### ขั้นที่ 1: ตรวจสอบบริบทภาพใหญ่ (Tier 4: Macro & Intermarket)
- ดูแนวโน้มเศรษฐกิจมหภาค นโยบายดอกเบี้ย และความสัมพันธ์ระหว่างสินทรัพย์ (เช่น Gold vs USD, Bond Yields) เพื่อทราบว่าตลาดอยู่ในโหมด **Risk-On** หรือ **Risk-Off**

### ขั้นที่ 2: ดึง Confluence เสริมหลัก (Tier 2: COT & Algorithmic Filters)
- **COT Intelligence**: ตรวจสอบการวางสถานะของ Commercial Hedgers (Smart Money) เทียบกับ Large Speculators, ดู COT Index และสัญญาณ 40-Point Surge เพื่อยืนยันว่าทิศทางที่จะเล่นสอดคล้องกับรายใหญ่
- **Algorithmic Strategy**: ตรวจสอบพฤติกรรมราคาเชิงสถิติ — อยู่ในสภาวะ Mean-Reverting หรือ Trending (Hurst Exponent, ADF test), คำนวณ Half-Life เพื่อประเมินระยะเวลาถือครอง position และหลีกเลี่ยง Bias ต่างๆ

### ขั้นที่ 3: ระบุตำแหน่งโครงสร้างและมูลค่าราคา (Tier 3: Auction Market Theory & Market Profile)
- หาจุดสมดุลราคา Value Area (VAH, VAL, POC), Day Type, Initial Balance จาก Market Profile และ Auction Market Theory

### ขั้นที่ 4: วางแผนเข้าเทรดด้วยแกนหลักคู่ (Tier 1: `trade-setup.md` + `vsa-weis-wyckoff.md` - MANDATORY PRIMARY CORES)
- **Structure & Lines**: ระบุทิศทางหลักใน HTF (H1/M30), หา Boss Major, CHoCH, Inducement และตี Ice Line / Axis Line
- **Liquidity Hunt & Springs/Upthrusts**:
  - หา Retail Traps (Equal H/L, Trendline liquidity)
  - ยืนยันการกวาดสภาพคล่องด้วย **Springs** (กวาดล่างแล้วดึงกลับ) หรือ **Upthrusts** (กวาดบนแล้วรูดลง) บน Key Levels / Ice Line
- **Volume & Effort vs. Reward (VSA)**:
  - ตรวจสอบ Volume Spread: แท่งเทียนที่วิ่งแรงต้องมีโวลุ่มสนับสนุน (Effort vs Result)
  - หาการดูดซับแรงซื้อ/ขาย (Absorption) และการชะลอตัวของแรงส่ง (Shortening of Thrust - SOT)
- **Setup Pattern**: เลือกท่าสังหาร (AMD Manipulation Zone, Clean Traffic, Fail Swing, 3D Pattern)
- **Execution Trigger**: ซูมดู LTF (M1/M5) เพื่อรอการยืนยัน **1-2-3 Entry (Break -> Retest -> Reject)**:
  - จังหวะ **Retest** ต้องยืนยันด้วย **Low Volume Test** หรือ Vertical Area Test เพื่อยืนยันว่าไม่มีแรงขาย/ซื้อสวนทาง
- **Money & Port Management**:
  - กำหนด Safety SL (300-500 จุดสำหรับทองคำ M1)
  - กำหนดเป้าหมาย TP1 ปิดกำไร 70-80% ที่ระยะ 1:1 หรือ 1:1.5
  - ตั้งกันหน้าทุน (Risk-Free) สำหรับออเดอร์ Bonus 20-30% ที่เหลือเพื่อรันเทรนด์ยาว
  - แบ่งพอร์ตตามระดับความเสี่ยง (พอร์ตหลัก Fixed Risk 0.25-1%, พอร์ตลูก B/C/D สำหรับจังหวะ High Risk)

---

## 3. Directory Manifest & Topic Routing Table

| File | Tier | Role | Scope & Primary Topics | Read When |
|---|---|---|---|---|
| [`trade-setup.md`](trade-setup.md) | **Tier 1** | **Primary Core (Execution Playbook)** | SMC, Liquidity Sweeps, AMD, 1-2-3 Entry, Clean Traffic, Fail Swing, 3D, Money Management 15/35/50, Port B/C/D | **ทุกครั้ง** ที่คิด Plan เทรด หรือวิเคราะห์ Price Action / Execution |
| [`vsa-weis-wyckoff.md`](vsa-weis-wyckoff.md) | **Tier 1** | **Primary Core (Price-Volume & VSA)** | Volume Spread Analysis, Weis-Wyckoff, Springs, Upthrusts, Ice Line, Effort vs Reward, Bar reading, Absorption | **ทุกครั้ง** ที่คิด Plan เทรด เพื่ออ่านโวลุ่มควบราคา, ยืนยันการ Sweep, และตรวจจังหวะ Test |
| [`cot-intelligence.md`](cot-intelligence.md) | **Tier 2** | **Secondary Confluence** | CFTC, Commercials vs Speculators, Net Position, COT Index, 40-Point Surge, Sentiment Extremes | ต้องการยืนยันเจตนาของ Smart Money รายใหญ่ หรือทิศทางระยะกลาง-ยาว |
| [`algorithmic-strategy.md`](algorithmic-strategy.md) | **Tier 2** | **Secondary Confluence** | Backtesting, Mean Reversion, ADF test, Hurst exponent, Half-Life, Cointegration, Microstructure | ต้องการความได้เปรียบทางสถิติ, Holding time, ตรวจสอบ Bias เชิงปริมาณ |
| [`market-profile.md`](market-profile.md) | **Tier 3** | **Tertiary Structure** | Steidlmayer Method, TPO, Value Area (VAH/VAL/POC), Initial Balance, Excess/Tails | ต้องการหา Key Levels, Value Area, หรือตรวจดูสภาวะเปิดตลาด |
| [`auction-market-theory.md`](auction-market-theory.md) | **Tier 3** | **Tertiary Structure** | Auction Process, Day Types (Trend, Normal, Double Dist), 80% Rule, Open Types | ต้องการจำแนกประเภทของวันเทรด และพฤติกรรมการทดสอบราคา |
| [`global-macro.md`](global-macro.md) | **Tier 4** | **Contextual Macro** | Macro Regimes, Central Banks, Policy Rates, Economic Data (CPI/GDP/ISM) | ต้องการประเมินบรรยากาศเศรษฐกิจมหภาค และข่าวตัวเลขสำคัญ |
| [`intermarket.md`](intermarket.md) | **Tier 4** | **Contextual Macro** | Gold-USD inverse correlation, US 10Y Yields, Oil dynamics, Carry trade | ต้องการตรวจสอบความสัมพันธ์ข้ามตลาด (โดยเฉพาะทองคำกับดอลลาร์) |

---

## 4. AI Query & Token Management Rules

1. **Trade Plan Query**: อ่าน Tier 1 Cores (`trade-setup.md` และ `vsa-weis-wyckoff.md`) เป็นหลักเสมอ เสริมด้วย Confluence จาก Tier 2 (`cot-intelligence.md` หรือ `algorithmic-strategy.md`) รวมไม่เกิน 2-3 ไฟล์ต่อคำถาม
2. **Specific Concept Query**: หากถามเฉพาะเจาะจง ให้เปิดอ่านเฉพาะไฟล์ที่ตรงกับ Topic ใน Routing Table เท่านั้น
3. **Never Read All Files**: ห้ามเปิดอ่านทั้ง 8 ไฟล์พร้อมกันในคำถามเดียว เพื่อประหยัด Token และป้องกันการหลอน (Hallucination)
4. **Strict Grounding**: ให้ตอบอิงตามหลักการที่ระบุในไฟล์เท่านั้น หากไม่มีข้อมูลให้ตอบว่า "ไม่พบข้อมูลนี้ใน Knowledge Base"
