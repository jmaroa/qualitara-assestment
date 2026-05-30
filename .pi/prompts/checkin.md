---
description: Session check-in (git + docs + OpenSpec)
argument-hint: "[optional focus]"
---

Run a **session check-in** before starting work. This repo uses **Pi + OpenSpec**.

Follow these steps, in order. At the end, provide a short summary + questions to pick the next step.

## 1) Sync safety (before touching anything)
- Run: `git branch --show-current`
- Run: `git fetch origin` (if remote exists)
- Run: `git status`
- If there are uncommitted changes or the branch is behind: **STOP** and ask.

## 2) Repo status (git)
- Run: `git status`
- Run: `git branch --show-current`
- Run: `git log -10 --oneline --decorate`
- If there are uncommitted changes:
  - Run: `git diff`
  - Run: `git diff --cached` (if applicable)

## 3) Project context (docs)
- Read fully: `AGENTS.md`
- Read: `docs/technical-design.md`

## 4) OpenSpec (active changes)
- Run: `openspec list --json`
- If there is an active change, read its key artifacts:
  - `openspec/changes/<name>/proposal.md`
  - `openspec/changes/<name>/design.md`
  - `openspec/changes/<name>/tasks.md`

## 5) Output
Provide:
- **Summary (max 10 bullets):** where we are (branch, sync state, local changes, OpenSpec change, blockers)
- **Recommendation:** 1 concrete next action for today
- **Questions:** 1–3 questions to confirm before implementing (if information is missing)

User focus (optional): $@
