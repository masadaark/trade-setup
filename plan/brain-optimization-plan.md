# Brain Knowledge Base Optimization Plan

> เป้าหมาย: จัดเรียงเทคนิคใน `brain/` ใหม่เพื่อให้ AI อ่านได้ไวขึ้น โดยไม่ทำให้เนื้อหาเพี้ยนหรือหายไป

---

## ปัญหาที่พบจากการวิเคราะห์ทั้ง 10 ไฟล์

### 🔴 Critical Issues

| # | ปัญหา | ไฟล์ที่เจอ | ผลกระทบ |
|---|--------|-----------|---------|
| 1 | **Collapsed Tables** — ตาราง Markdown ถูกบีบเป็นบรรทัดเดียว | `vsa-weis-wyckoff`, `cot-intelligence`, `algorithmic-strategy`, `global-macro`, `market-profile` | AI parser อ่านตารางไม่ได้ / ข้อมูลหาย |
| 2 | **Glued Headers** — หัวข้อ Bold ติดกับย่อหน้าก่อนหน้าไม่มี linebreak | `auction-market-theory`, `market-profile`, `global-macro`, `intermarket` | AI แยก section ไม่ออก / tokenizer สับสน |
| 3 | **CSV/Tab Tables** — ตารางเขียนเป็น CSV แทน Markdown pipes | `cot-intelligence`, `algorithmic-strategy`, `intermarket`, `fx-machine` | ไม่ render เป็นตาราง |
| 4 | **Monster Lines** — บรรทัดเดียวยาว 2,000+ ตัวอักษร | `market-profile` (L51: 2,200 chars) | Sentence tokenizer พัง |
| 5 | **`fx-machine.md` ขัดแย้งกับระบบหลัก** — ใช้ EMA 50 + Fibonacci (Retail) ซึ่งตรงข้ามกับ SMC/Wyckoff | `fx-machine.md` | AI สับสน / Hallucinate คำตอบผิดระบบ |

### 🟡 Moderate Issues

| # | ปัญหา | ไฟล์ที่เจอ | ผลกระทบ |
|---|--------|-----------|---------|
| 6 | **Frontmatter/Body Mismatch** — YAML บอก 7 sections แต่มีจริง 5 | `algorithmic-strategy` | Metadata misleading |
| 7 | **BTCUSD ไม่มีเนื้อหาเลย** — ทั้ง 10 ไฟล์ไม่เคยพูดถึง Bitcoin | ทุกไฟล์ | Knowledge gap สำหรับ 1 ใน 3 assets หลัก |
| 8 | **ข้อมูลซ้ำซ้อนข้าม Tier** — AMT + MP ซ้ำกัน ~50% | `auction-market-theory` ↔ `market-profile` | เปลืองตำแหน่ง token |
| 9 | **Out-of-scope assets** — FX pairs (AUD, JPY, EUR), Orange Juice, Baltic Dry Index | `intermarket`, `global-macro`, `cot-intelligence` | เปลือง token กับข้อมูลไม่เกี่ยว |
| 10 | **Skipped heading levels** — H1 → H3 ข้าม H2 | `trade-setup`, `cot-intelligence`, `market-profile` | AST parser สร้าง outline ผิด |

---

## User Review Required

> [!IMPORTANT]
> ### ต้องตัดสินใจ 3 เรื่องก่อนเริ่มงาน

### Q1: `fx-machine.md` — ลบหรือเก็บ?

ไฟล์นี้:
- ❌ ไม่มี YAML frontmatter
- ❌ ไม่ถูกอ้างอิงใน README.md หรือ SKILL.md เลย
- ❌ ใช้ EMA 50 + Fibonacci Retracement ซึ่งขัดกับ SMC/Wyckoff ของ Tier 1
- ❌ เนื้อหาที่ถูกต้อง (BOS, CHoCH, Liquidity Sweep, 80/20 Close) มีอยู่ใน `trade-setup.md` แล้วทั้งหมด
- ❌ เน้น Forex แต่ project ใช้แค่ Gold/BTC/Oil

**แนะนำ: Archive ไปไว้ `brain/_archived/` แล้วลบออกจาก active brain**

### Q2: Merge `auction-market-theory.md` + `market-profile.md` เป็นไฟล์เดียว?

ทั้ง 2 ไฟล์ซ้ำกัน ~50% (Initiative vs Responsive, Value Area, Present-tense market logic)
- **Option A (แนะนำ)**: Merge เป็น `auction-and-profile.md` → ลด token ~40%, AI อ่าน 1 ไฟล์แทน 2
- **Option B**: คงแยก 2 ไฟล์ แต่ตัดส่วนซ้ำออก

### Q3: เพิ่มเนื้อหา BTCUSD (Bitcoin) ไหม?

ตอนนี้ BTCUSD ไม่มีเนื้อหาใดๆ ใน brain/ ทั้งที่เป็น 1 ใน 3 assets หลัก
- **Option A**: เพิ่ม Bitcoin-specific notes ในรอบนี้
- **Option B (แนะนำ)**: ไม่เพิ่มตอนนี้ — focus ที่ optimize formatting ก่อน ไม่เขียนเนื้อหาใหม่

---

## Proposed Changes

### Phase 1: Fix Formatting — ทำให้ AI parse ได้ถูกต้อง (ไม่เปลี่ยนเนื้อหา)

#### [MODIFY] [trade-setup.md](file:///Users/masada.h/Desktop/Personal/Project/trade-setup/brain/trade-setup.md)
- แก้ heading hierarchy: H1 → H2 → H3 (ไม่ข้าม H2)

#### [MODIFY] [vsa-weis-wyckoff.md](file:///Users/masada.h/Desktop/Personal/Project/trade-setup/brain/vsa-weis-wyckoff.md)
- แก้ collapsed table (L30) → expand เป็น multi-line Markdown table
- แก้ run-on sentences ที่ขาด linebreak (L26, L68)
- เพิ่ม blank line ก่อน headers

#### [MODIFY] [cot-intelligence.md](file:///Users/masada.h/Desktop/Personal/Project/trade-setup/brain/cot-intelligence.md)
- แก้ collapsed table (L22) → expand
- แก้ CSV table (L51-56) → Markdown pipes
- แก้ escaped periods ใน headings
- ตัดตัวอย่าง out-of-scope assets (Orange Juice, Grain, Deere & Co) ที่ไม่เกี่ยวกับ Gold/BTC/Oil

#### [MODIFY] [algorithmic-strategy.md](file:///Users/masada.h/Desktop/Personal/Project/trade-setup/brain/algorithmic-strategy.md)
- แก้ collapsed table (L28) → expand
- แก้ CSV table (L74-77) → Markdown pipes
- แก้ frontmatter sections list ให้ตรงกับ body (5 sections ไม่ใช่ 7)

#### [MODIFY] [auction-market-theory.md](file:///Users/masada.h/Desktop/Personal/Project/trade-setup/brain/auction-market-theory.md)
- แก้ glued "Connective Tissue" headers (L33, L52, L69, L96, L124)
- แก้ CSV table (L30-32) → Markdown pipes
- แก้ escaped periods ใน headings

#### [MODIFY] [market-profile.md](file:///Users/masada.h/Desktop/Personal/Project/trade-setup/brain/market-profile.md)
- **แก้ monster line L51 (2,200 chars)** → split เป็นหลายย่อหน้า
- แก้ collapsed tables (L23, L38)
- แก้ glued headers (L28, L32, L51, L59)

#### [MODIFY] [global-macro.md](file:///Users/masada.h/Desktop/Personal/Project/trade-setup/brain/global-macro.md)
- แก้ collapsed table (L29)
- แก้ glued headers (L30, L39, L50, L59, L73, L77, L79)

#### [MODIFY] [intermarket.md](file:///Users/masada.h/Desktop/Personal/Project/trade-setup/brain/intermarket.md)
- แก้ glued "So What?" headers (L38, L54, L72, L87, L99)
- แก้ CSV table (L62-65) → Markdown pipes

---

### Phase 2: Structure Tags — บอก AI ว่าอ่านแบบไหน

เพิ่ม `reading_mode` ใน YAML frontmatter ของทุกไฟล์:

```yaml
reading_mode: sequential | standalone | hybrid
sequential_sections: [list of sections ที่ต้องอ่านเรียงลำดับ]
standalone_sections: [list of sections ที่อ่านแยกได้]
```

| ไฟล์ | Reading Mode | Sequential Parts | Standalone Parts |
|------|-------------|-----------------|-----------------|
| `trade-setup.md` | `hybrid` | Sections 1→6 (execution pipeline) | Risk tables, Port B/C/D |
| `vsa-weis-wyckoff.md` | `hybrid` | Section 5 (checklist), Bar reading | Sections 1-3 (geometric tools) |
| `institutional-microstructure-patterns.md` | `standalone` | — | ทุก pattern (query by ID) |
| `cot-intelligence.md` | `hybrid` | Section 5 (weekly workflow) | Sections 1-4 (reference) |
| `algorithmic-strategy.md` | `standalone` | — | ทุก section |
| `auction-market-theory.md` | `sequential` | Pre-market → IB → Intraday → Execution | — |
| `market-profile.md` | `hybrid` | Section 6 (checklist) | Sections 1-5 (reference) |
| `global-macro.md` | `hybrid` | Section 8 (9-step audit) | Sections 1-7 (reference) |
| `intermarket.md` | `hybrid` | Section 6 (checklist) | Sections 1-5 (essays) |

---

### Phase 3: Handle `fx-machine.md` (ถ้า Q1 = Archive)

#### [NEW] `brain/_archived/` — สร้าง archived folder
#### Move `fx-machine.md` → `brain/_archived/fx-machine.md`

---

### Phase 4: Merge AMT + MP (ถ้า Q2 = Option A)

#### [NEW] [auction-and-profile.md](file:///Users/masada.h/Desktop/Personal/Project/trade-setup/brain/auction-and-profile.md)
โครงสร้างใหม่ (รวม 2 ไฟล์ ตัดส่วนซ้ำ):
1. Philosophy: Auction Process & Market-Generated Information
2. Value Area Mechanics: TPO, VAH/VAL/POC, Bell Curve Distribution
3. Day Classification: 6 Day Types, Initial Balance, Opening Types
4. Tactical Signals: 80% Rule, Single Prints, Excess/Tails, Auction Points
5. Execution: Initiative vs Responsive Activity, Two Big Questions
6. Checklist: Combined Pre-Market to Intraday Workflow

#### [DELETE] `auction-market-theory.md`
#### [DELETE] `market-profile.md`

---

### Phase 5: Update README.md + SKILL.md

#### [MODIFY] [README.md](file:///Users/masada.h/Desktop/Personal/Project/trade-setup/brain/README.md)
- อัปเดต Directory Manifest ตาม structure ใหม่
- อัปเดต Mermaid diagram
- เพิ่ม `reading_mode` column ใน routing table

#### [MODIFY] [SKILL.md](file:///Users/masada.h/Desktop/Personal/Project/trade-setup/.agents/skills/marker-analyzer/SKILL.md)
- อัปเดต Decision Hierarchy diagram
- อัปเดต Topic Routing Table

---

## Verification Plan

### Automated Tests
```bash
# 1. ตรวจว่าทุกไฟล์มี valid YAML frontmatter
for f in brain/*.md; do head -1 "$f" | grep -q "^---" && echo "✅ $f" || echo "❌ $f"; done

# 2. ตรวจว่าไม่มี collapsed tables (|| pattern)
grep -rn '||' brain/*.md

# 3. ตรวจว่าไม่มี monster lines (>500 chars)
awk 'length > 500 {print FILENAME":"NR": "length" chars"}' brain/*.md

# 4. ตรวจว่าไม่มี glued headers (text**Header)
grep -rn '[a-z]\*\*[A-Z]' brain/*.md

# 5. Word count comparison (ก่อน vs หลัง) เพื่อยืนยันว่าไม่มีเนื้อหาหาย
wc -w brain/*.md
```

### Manual Verification
- อ่านทุกไฟล์ที่แก้ไขเทียบกับ original เพื่อยืนยันว่าเนื้อหาครบไม่เพี้ยน
- ทดสอบ marker-analyzer skill ด้วยคำถามเทรดจริง
