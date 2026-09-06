# Optimize `marker-analyzer` Skill & Reorganize `brain/` for AI-Optimal Consumption

## Goal

Two-pronged optimization:
1. **Skill** — Make `marker-analyzer` faster, less hallucination-prone, and consume fewer tokens
2. **Brain** — Reorganize content structure so AI can navigate, scope, and digest information efficiently — **without changing any knowledge content**

---

## Current Problems Identified

### Skill (`marker-analyzer/SKILL.md`)

| Problem | Impact |
|---------|--------|
| **No topic index / routing table** | AI reads ALL 9 files (~99 KB / ~25k tokens) on every query, even when only 1-2 files are relevant |
| **No scoping rules** | AI doesn't know which file answers which question type → reads everything → slow + expensive |
| **"Read the files" instruction is vague** | Encourages full-file reads instead of targeted grep → token waste |
| **No output format constraints** | AI generates long, essay-like responses → more tokens out |
| **No hallucination guardrails** | Only "Stay Grounded" — no explicit "say I don't know" or confidence-threshold rules |
| **Typo in skill name** | `marker-analyzer` should probably be `market-analyzer` but we'll preserve the name for compatibility |

### Brain (`brain/`)

| Problem | Impact |
|---------|--------|
| **`VSA.md` and `Weis-Wyckoff Method.md` are 100% identical** (11,354 bytes each) | Duplicate data → double token cost, confusion for AI |
| **No manifest/index file** | AI must read file names and guess content scope → slow routing |
| **Files have spaces in names** | Harder for grep/tool calls, potential encoding issues |
| **No YAML frontmatter** | AI can't quickly scan metadata (topic, keywords, scope) without reading full content |
| **Wall-of-text paragraphs** | Dense prose without line breaks forces AI to load entire sections to find a fact |
| **Tables embedded as inline text** | Markdown tables collapsed into single lines → hard for AI to parse |
| **`trade-setup.md` is in Thai** (all others English) | Language context-switch costs extra tokens for bilingual processing |
| **No logical reading order** | AI doesn't know the top-down analysis flow (Macro → Micro) |

---

## Proposed Changes

### Component 1: Brain Directory Reorganization

> [!IMPORTANT]
> **Zero content changes.** Only structural improvements: renaming files, adding frontmatter headers, adding an index file, and fixing the duplicate file issue.

#### [NEW] `brain/README.md` — Master Index & Routing Table

A compact routing manifest (~30 lines) that the AI reads FIRST to determine which file(s) to open. Contains:
- Ordered reading hierarchy (Macro → Micro)
- Per-file: filename, scope keywords, "when to read" description
- Token-budget guidance

#### File Renames (spaces → kebab-case)

| Current Name | New Name |
|-------------|----------|
| `Algorithmic Strategy Framework.md` | `algorithmic-strategy.md` |
| `Global Macro Framework.md` | `global-macro.md` |
| `Intermarket.md` | `intermarket.md` (no change) |
| `Leveraging COT Insider Intelligence.md` | `cot-intelligence.md` |
| `Market Profile Trade.md` | `market-profile.md` |
| `The Auction Market Theory Framework.md` | `auction-market-theory.md` |
| `Volume Spread Analysis (VSA).md` | `vsa-weis-wyckoff.md` (merge the duplicate) |
| `Weis-Wyckoff Method.md` | **DELETE** (identical to VSA) |
| `trade-setup.md` | `trade-setup.md` (no change) |

#### Add YAML Frontmatter to Each File

Each brain file gets a small frontmatter block (~5 lines) with:
```yaml
---
id: global-macro
scope: macro regime, GDP, inflation, central banks, FX, equities, commodities
layer: 1-macro
keywords: regime, policy rate, impossible trinity, ISM, Baltic Dry
---
```

This lets the AI scan scope without reading the full file (~50 tokens vs ~3000 tokens per file).

#### Format Improvements (no content changes)

- Break wall-of-text paragraphs into proper markdown paragraphs (add line breaks between logical sections)
- Format inline tables as proper markdown tables
- Ensure consistent heading hierarchy (`#` → `##` → `###`)

---

### Component 2: Skill SKILL.md Rewrite

#### [MODIFY] `.agents/skills/marker-analyzer/SKILL.md`

Complete rewrite with the following improvements:

1. **Routing Table** — Inline topic→file mapping so the AI knows exactly which 1-2 files to read
2. **Two-Phase Protocol**:
   - Phase 1: Read `brain/README.md` (index) → identify relevant file(s)
   - Phase 2: Grep for specific keywords → Read only the relevant sections
3. **Token Budget Rules** — "Read at most 2 brain files per query"
4. **Hallucination Guardrails**:
   - "If the answer is not found in brain/, say 'ไม่พบข้อมูลนี้ใน Knowledge Base'"
   - "Never extrapolate beyond what the brain files state"
   - "Quote the source section heading when citing"
5. **Output Format Constraints**:
   - Concise bullet-point answers (not essays)
   - Max 3-5 key points per response
   - Always end with source citation

#### [NEW] `.agents/skills/marker-analyzer/references/topic-map.md`

A detailed topic→file→section mapping for the AI to use as a lookup table. This is the "cheat sheet" that eliminates full-file scanning.

---

## Open Questions

> [!IMPORTANT]
> **Duplicate file:** `Volume Spread Analysis (VSA).md` and `Weis-Wyckoff Method.md` are byte-for-byte identical. The content title inside both files says "Mastering the Trade Setup via the Weis-Wyckoff Method". Was there supposed to be a separate VSA document? Should I:
> - (A) Keep one merged file `vsa-weis-wyckoff.md` and delete the duplicate
> - (B) Keep both names (as symlinks or copies) for backward compatibility

> [!IMPORTANT]
> **Thai content in `trade-setup.md`:** This file is entirely in Thai while all others are in English. This causes extra token overhead for bilingual processing. Should I:
> - (A) Keep it in Thai as-is (it's the master trading playbook, language is intentional)
> - (B) Add an English summary frontmatter while keeping Thai body

---

## Verification Plan

### Automated Tests
- `diff` before/after brain files to confirm zero content changes (only structure)
- Verify no broken file references in SKILL.md
- Confirm duplicate file is removed

### Manual Verification
- Test a sample query (e.g., "อธิบาย AMD pattern") and verify:
  - AI reads only `trade-setup.md` (not all 9 files)
  - Response cites the source
  - Token count is significantly lower than before
