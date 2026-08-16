---
trigger: model_decision
description: When creating, updating, or entering Plan mode for an implementation plan, task breakdown, roadmap, or strategy document.
---

# Persist Plans in `plan/`

All planning work for this repository must be written to the `plan/` folder at the repo root — not only in chat or ephemeral agent storage.

## When this applies

- Entering Plan mode or drafting an implementation plan
- Creating a new task breakdown, roadmap, or strategy document
- Updating, revising, or extending an existing plan
- Splitting a large effort into phased plans

## Required behavior

1. **Create** new plans as markdown files under `plan/`.
2. **Update** existing plans by editing the matching file in `plan/` instead of leaving changes in chat only.
3. **Name files** with lowercase kebab-case (e.g., `dashboard-data-summary.md`, `smc-v3-upgrade-plan.md`).
4. **Reuse** an existing file when the plan covers the same topic; do not create duplicate plan files for the same workstream.
5. **Confirm** the saved path when a plan is created or modified.

## File format

- Use markdown (`.md`).
- Include a clear title, goal, scope, and actionable steps or phases.
- Use mermaid diagrams or tables when they clarify architecture or workflow (see @plan/dashboard_data_summary.md as a reference).

## Do not

- Keep plans only in conversation history or IDE brain storage without a `plan/` file.
- Write plan documents outside `plan/` unless the user explicitly requests another location.
