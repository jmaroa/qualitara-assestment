---
description: Task wrap-up (OpenSpec + git)
argument-hint: "[change-name | optional focus]"
---

Close out this session/task with a complete **wrap-up**. This repo uses **OpenSpec (OPSX)**.

Follow these steps, in order. **Do not perform destructive or irreversible actions** without explicit confirmation.

## 1) Repo status (safety)
- Run: `git branch --show-current`
- Run: `git status`
- If there are uncommitted changes:
  - Explain the state
  - Propose options (commit/stash) and **ask what to do**

## 2) Identify what we are closing
Use `$@` as a hint.
- If you detect a change name, treat it as the **primary change**.
- If you cannot infer confidently, list options and **ask**:
  - `openspec list --json`

## 3) OpenSpec (what is left to close)
- Run: `openspec list --json`
- If there are relevant change(s):
  - Run: `openspec status --change "<name>" --json`
  - Read: `openspec/changes/<name>/tasks.md`
  - Report:
    - artifact statuses (done/ready/blocked)
    - how many tasks are still unchecked (`- [ ]`)

**Suggested actions (do NOT execute without confirmation):**
- If tasks incomplete → recommend `/opsx-apply <name>`.
- If tasks complete → recommend `/opsx-verify <name>` and then `/opsx-archive <name>`.

## 4) Export AI session

Remind the user to export this session for the `ai-sessions/` folder:

```
/export ai-sessions/<descriptive-name>.html
```

The assessment requires exported AI conversation logs. Each meaningful session
should be exported before closing.

## 5) Output (checklist)
Provide a clear checklist with:
- current branch + sync state
- local changes (yes/no)
- OpenSpec: change name + pending tasks + recommended next (apply/verify/archive)
- AI session exported? (yes/no)

End with 1–3 confirmation questions to execute next steps.
