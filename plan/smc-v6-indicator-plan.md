# Implementation Plan: SMC v6 Indicator (Mastery & Marker-Analyzer Unified Engine)

ยกระดับ **SMC Indicator จาก v5 สู่ v6** (`indicator/smc-v6.pine`) โดยผสานองค์ความรู้ทั้งหมดจาก **`marker-analyzer`** และคลังความรู้ `brain/` ที่ได้รับการจัดระเบียบใหม่ เข้าสู่ Pine Script v6 อย่างสมบูรณ์แบบ พร้อมระบบตรวจสอบความถูกต้องซ้ำๆ (Iterative Verification)

---

## User Review Required

> [!IMPORTANT]
> ### ประเด็นที่ต้องการให้ผู้ใช้งานตรวจสอบและยืนยัน

1. **Plot Count Budget (Pine Script v6 Limit: 64 Plots)**:
   - ใน v5 มีการใช้ plots อย่างประหยัด (EMA200, Sigma Bands, HAMA Candles, 25EMA, Signal Dots) ซึ่งใช้ไปเพียง ~10-12 plots
   - ใน v6 เราจะยังคงเน้นการวาดด้วย **Boxes, Lines, Labels, และ Tables** ซึ่งมีโควตาสูงถึง 500 ออบเจ็กต์ต่อประเภท เพื่อไม่ให้ชนเพดาน 64 plots ของ TradingView
2. **การคงความเข้ากันได้กับ v5 (Backward Compatibility)**:
   - โค้ด v5 ทั้งหมด (SMC Core, Internal/Swing Structure, Order Blocks พร้อม 50% CE line, FVG/IFVG, HAMA, 4-Tier Sniper, 1-2-3 Retest) จะถูกเก็บรักษาไว้ครบถ้วน 100% โดย v6 จะเป็นการ **ต่อยอดและเสริมฟังก์ชันใหม่** ด้าน Wyckoff/VSA, Auction, และ Microstructure เข้าไป
3. **สวิตช์เปิด/ปิดแยกแต่ละโมดูล**:
   - ทุกฟังก์ชันใหม่จะมี toggle switch ในหน้า Settings เพื่อให้เทรดเดอร์เลือกเปิด/ปิดได้ตามต้องการ โดยค่าเริ่มต้นจะเปิดเฉพาะฟังก์ชันที่เพิ่มแต้มต่อสูงสุด

---

## 1. การต่อยอดจาก v5 สู่ v6 ด้วย Knowledge `/marker-analyzer`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MAZADA SMC v6 — MASTER STRATEGY ENGINE                   │
│                                                                             │
│ ┌───────────────────────────┐  ┌──────────────────────────────────────────┐ │
│ │   v5 FOUNDATION (Retained)│  │   v6 KNOWLEDGE EXTENSIONS (New)          │ │
│ │ • EMA200 & Sigma Bands    │  │ • Wyckoff Springs & Upthrusts (Tier 1)   │ │
│ │ • Taylor Series Momentum  │  │ • VSA Effort vs Reward Engine (Tier 1)   │ │
│ │ • Real BOS & CHoCH (FVG)  │  │ • VSA Low-Volume Test on 1-2-3 Retest     │ │
│ │ • Dynamic OBs with 50% CE │  │ • Dynamic Ice Line & Axis Line Geometry  │ │
│ │ • IFVG Inversion Tracking │  │ • Initial Balance & Day Type (Tier 3)    │ │
│ │ • HAMA Candle Overlay     │  │ • 80% Value Area Rule Monitor (Tier 3)   │ │
│ │ • 4-Tier Sniper Scoring   │  │ • Hurst Proxy Mean-Reverting Filter(T2)  │ │
│ │ • XAU Safety SL Floor     │  │ • Breakeven Armor & 70-80% TP Protocol   │ │
│ └───────────────────────────┘  └──────────────────────────────────────────┘ │
│                                      │                                      │
│                                      ▼                                      │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                  UNIFIED MULTI-TIER INSTITUTIONAL HUD                   │ │
│ │  [Tier 1: SMC+VSA] [Tier 2: Quant/Hurst] [Tier 3: Auction] [Tier 4: Sizing]│ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### ฟังก์ชันใหม่ที่จะเพิ่มใน v6:

#### A. Wyckoff Spring & Upthrust Engine (`brain/vsa-weis-wyckoff.md` - Tier 1)
- **Spring (Bullish)**: ตรวจจับจังหวะที่ราคาแทงหลุด Swing Low / Ice Line แล้วดึงกลับขึ้นมาปิดเหนือเส้นอย่างรวดเร็ว (Wick sweep) พร้อมตรวจสอบ Volume:
  - *Type 1 (Climax/Stopping Volume)*: หลุดด้วยโวลุ่มมหาศาลแล้วถูกดูดซับ (Absorption)
  - *Type 2/3 (Low Volume Test)*: หลุดแล้วไม่มีแรงขายตาม (Supply exhausted)
  - แสดงป้าย `SPRING` ที่ฐานแท่งเทียน
- **Upthrust (UT / UTAD, Bearish)**: ตรวจจับจังหวะแทงทะลุ Swing High / Ice Line แล้วรูดลงปิดต่ำกว่าเส้นทันที แสดงป้าย `UPTHRUST`

#### B. VSA Effort vs. Reward Engine (`brain/vsa-weis-wyckoff.md` - Tier 1)
- **Absorption Bar**: แท่งเทียนที่โวลุ่มสูงผิดปกติ (`vol > 2.0 * vol_sma20`) แต่ Spread (High-Low) แคบ บ่งบอกว่ามีสถาบันตั้งรับออเดอร์
- **No Supply / No Demand Test**: แท่งเทียนย่อตัวที่ Spread แคบและโวลุ่มแห้ง (`vol < 0.7 * vol_sma20`) บ่งบอกว่าไม่มีแรงต้าน
- **Shortening of Thrust (SOT)**: วัดระยะการขยายตัวของ Swing Highs/Lows 連續กัน ถ้าระยะแคบลงเรื่อยๆ ทั้งที่ยังมีแรงดัน จะส่งสัญญาณ Exhaustion ล่วงหน้า

#### C. VSA-Validated 1-2-3 Entry Retest (`brain/trade-setup.md` §5 + `vsa-weis-wyckoff.md` §5)
- ใน v5 ขั้นที่ 2 (Retest) ตรวจเพียงระดับราคา
- ใน v6 ขั้นที่ 2 จะต้องผ่าน **VSA Low-Volume Test**: เมื่อราคาย่อกลับมาทดสอบ POI โวลุ่มจะต้องต่ำกว่าค่าเฉลี่ย (`vol < vol_sma20`) หรือเกิด No Supply / No Demand Candle ป้องกัน Fake Retest

#### D. Dynamic Ice Line & Axis Line Geometry (`brain/vsa-weis-wyckoff.md` §1)
- **Ice Line**: เส้นแนวรับหลักที่ถูกทะลุแล้วเปลี่ยนเป็นแนวต้าน (Support-turned-Resistance ใต้น้ำแข็ง) พร้อม Alert เมื่อราคาขึ้นมา Test ใต้เส้น
- **Axis Line**: ระดับราคาที่เกิด Flip Zone ชัดเจน (Old Top $\rightarrow$ Support หรือ Old Bottom $\rightarrow$ Resistance)

#### E. Session Initial Balance (IB) & Auction Day Type Classifier (`brain/auction-and-profile.md` §2-§4 - Tier 3)
- คำนวณ **Initial Balance (IB High / IB Low)** จาก 60 นาทีแรกของเซสชันหลัก (London / NY)
- **Real-time Day Type Classifier**:
  - *Trend Day*: มี Range Extension ทะลุ IB เกิน $2.0\times$
  - *Normal Day*: ราคาวิ่งอยู่ในกรอบ IB ทั้งวัน
  - *Normal Variation Day*: ทะลุ IB ด้านเดียวประมาณ $1.5\times$
  - *Neutral Day*: ทะลุทั้งฝั่งบนและฝั่งล่างของ IB
- **80% Value Area Rule Monitor**: แจ้งเตือนเมื่อราคาเปิดนอกกรอบ Value Area / IB แล้วเทรดกลับเข้ามาในกรอบ มีโอกาส 80% ที่จะวิ่งทะลุไปอีกฝั่ง

#### F. Quantitative Stationarity / Hurst Proxy (`brain/algorithmic-strategy.md` §2 - Tier 2)
- คำนวณ Variance Ratio Proxy เพื่อประเมินสภาวะราคา:
  - $H < 0.5$ (Mean Reverting): เหมาะกับการเล่น Reversal / Fade / Range / 80% Rule
  - $H > 0.5$ (Trending / Persistent): เหมาะกับการเล่น Follow Trend / Breakout

#### G. Breakeven Armor & Position Management HUD (`brain/institutional-microstructure-patterns.md` §2 IMP-BE-ARMOR-06 + `trade-setup.md` §5)
- แสดงระดับ **TP1 (1:1 หรือ 1:1.5 RR)** สำหรับการปิดทำกำไร 70-80%
- แจ้งเตือน **BE Armor**: สั่งเลื่อน SL มาบังทุนทันทีเมื่อแตะ TP1 เพื่อปล่อย Bonus 20-30% รันเทรนด์แบบ Risk-Free
- คำนวณ Safety SL Buffer สำหรับทองคำ (XAU Min SL 300-500 pts)

---

## 2. Proposed Changes & File Architecture

### [NEW] [indicator/smc-v6.pine](file:///Users/masada.h/Desktop/Personal/Project/trade-setup/indicator/smc-v6.pine)
- สร้างไฟล์ใหม่ `smc-v6.pine` ขนาดสมบูรณ์ (~1,800-2,000 บรรทัด)
- รวบรวมฟังก์ชันเดิมของ v5 ทั้งหมด พร้อมเพิ่มโมดูล A-G ด้านบนอย่างเป็นระบบ
- จัดโครงสร้างเป็น 9 หมวดหมู่อย่างชัดเจน:
  1. `EMA, Sigma Bands & Trend Acceleration (Taylor Series)`
  2. `Smart Money Concepts (SMC) Core: Swing & Internal Structure (BOS, CHoCH)`
  3. `Order Blocks (with 50% CE) & Fair Value Gaps (with IFVG Continuity)`
  4. `Liquidity Sweeps & Wyckoff Springs/Upthrusts (Tier 1 Core)`
  5. `VSA Volume Spread Analysis & Effort vs. Reward Engine (Tier 1 Core)`
  6. `Auction Market Theory: Initial Balance & Day Types (Tier 3 Core)`
  7. `Quant Stationarity & Hurst Exponent Filter (Tier 2 Confluence)`
  8. `Mastery 1-2-3 Entry with VSA Retest Validation & Breakeven Armor`
  9. `Multi-Tier Institutional HUD Dashboard & Alert Engine`

### [NEW] [plan/smc-v6-indicator-plan.md](file:///Users/masada.h/Desktop/Personal/Project/trade-setup/plan/smc-v6-indicator-plan.md)
- บันทึกเอกสารแผนงานลงในโฟลเดอร์ `plan/` ตามกฎ `.agents/rules/plan-folder.md`

---

## 3. Verification & Validation Plan (ระบบตรวจสอบซ้ำๆ เรื่อยๆ)

เพื่อให้เป็นไปตามคำสั่ง *"พร้อมตรวจสอบซ้ำๆเรื่อยๆว่าถูกต้องหรือไม่"*:

### ขั้นตอนการตรวจสอบอัตโนมัติ (Iterative Automated Checks):

```bash
# 1. ตรวจสอบ Pine Script Version 6 Syntax & Header
head -5 indicator/smc-v6.pine | grep -q "//@version=6"

# 2. ตรวจสอบ Plot Budget (ต้องไม่เกิน 64 plots รวม plot, plotshape, plotchar, plotcandle, alertcondition)
# นับจำนวนคำสั่ง plot ทั้งหมดในสคริปต์
python3 -c "
with open('indicator/smc-v6.pine') as f:
    code = f.read()
import re
plots = re.findall(r'^\s*(plot|plotshape|plotchar|plotcandle|alertcondition|bgcolor)\s*\(', code, re.M)
print(f'Total plot functions used: {len(plots)} / 64 max')
assert len(plots) <= 64, 'Plot limit exceeded!'
"

# 3. ตรวจสอบ Syntax & Type Matching เบื้องต้นด้วย AST/Regex Validator
# ตรวจสอบว่าไม่มีตัวแปรที่ไม่ได้ประกาศ (undeclared identifiers) หรือ mismatched parentheses/brackets
python3 -c "
with open('indicator/smc-v6.pine') as f:
    lines = f.readlines()
# ตรวจสอบ balance ของวงเล็บ
open_paren = sum(l.count('(') - l.count(')') for l in lines)
open_bracket = sum(l.count('[') - l.count(']') for l in lines)
print(f'Paren balance: {open_paren}, Bracket balance: {open_bracket}')
assert open_paren == 0 and open_bracket == 0, 'Unbalanced parentheses or brackets!'
"

# 4. ตรวจสอบ Memory / Array Bounds
# ยืนยันว่าทุก array มีการป้องกัน out-of-bounds และมี garbage collection (pop/shift) เพื่อไม่ให้ล้น max 500

# 5. ตรวจสอบการคงอยู่ของฟังก์ชันเดิมจาก v5
# ยืนยันว่า core features ของ v5 (Taylor projection, IFVG, CE dotted lines, 4-tier sniper) อยู่ครบถ้วน
```

### ขั้นตอนการตรวจสอบทางเทคนิค (Domain Logic Verification):
- **Wyckoff Spring/Upthrust Logic**: ตรวจสอบว่าเงื่อนไข High/Low sweep ข้ามเส้นแล้วย้อนกลับปิดในแดนเดิมทำงานร่วมกับ Volume และ Wick length อย่างถูกต้อง
- **1-2-3 Retest VSA Gate**: ตรวจสอบว่าเงื่อนไข `e123_state == 2` บังคับเช็ค Volume test หรือไม่
- **Hurst Proxy**: ตรวจสอบสูตรอัตราส่วน Variance ระหว่างช่วงเวลาสั้นและยาวว่าไม่เกิด division by zero
- **HUD Table**: ตรวจสอบพิกัด cell และการแสดงผลสีตัวอักษรไม่ชนกัน
