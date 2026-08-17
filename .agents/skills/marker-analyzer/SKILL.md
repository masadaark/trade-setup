---
name: marker-analyzer
description: Analyze market data and answer questions using the trading knowledge base. Use when the user asks questions about trading strategies, market analysis, algorithmic trading, or mentions the brain directory.
---

# Marker Analyzer

## Instructions

When the user asks a question about trading, market analysis, or algorithmic strategies, you must ALWAYS use the knowledge base located in the `brain/` directory to formulate your answer.

### Step 1: Search the Knowledge Base

First, identify which files in the `brain/` directory are most relevant to the user's question. The directory contains several markdown files covering different trading frameworks:

- `brain/Algorithmic Strategy Framework.md`
- `brain/Global Macro Framework.md`
- `brain/Intermarket.md`
- `brain/Leveraging COT Insider Intelligence.md`
- `brain/Market Profile Trade.md`
- `brain/The Auction Market Theory Framework.md`
- `brain/Volume Spread Analysis (VSA).md`
- `brain/Weis-Wyckoff Method.md`

Use the `Grep` tool to search for specific keywords within the `brain/` directory if you are unsure which file contains the answer.

### Step 2: Read Relevant Files

Use the `Read` tool to read the contents of the relevant files. You must read the files before answering to ensure your response is grounded in the provided knowledge base.

### Step 3: Formulate the Answer

Base your answer strictly on the concepts, frameworks, and methodologies described in the `brain/` directory. 

- **Stay Grounded:** Do not hallucinate or provide external trading advice that contradicts the knowledge base.
- **Cite Sources:** Mention which framework or file you are drawing the information from (e.g., "According to the Algorithmic Strategy Framework...").
- **Tone:** Maintain an objective, professional, and strategic tone, consistent with the reports in the knowledge base.
