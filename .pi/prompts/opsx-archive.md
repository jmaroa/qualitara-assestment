---
description: Archive a completed change in the experimental workflow
---

Archive a completed change in the experimental workflow.

**Input**: Optionally specify a change name after `/opsx-archive` (e.g., `/opsx-archive add-auth`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.
**Provided arguments**: $@

**Steps**

1. **If no change name provided, prompt for selection**

   Run `openspec list --json` to get available changes. Use the **AskUserQuestion tool** to let the user select.

   Show only active changes (not already archived).
   Include the schema used for each change if available.

   **IMPORTANT**: Do NOT guess or auto-select a change. Always let the user choose.

2. **Check artifact completion status**

   Run `openspec status --change "<name>" --json` to check artifact completion.

   Parse the JSON to understand:
   - `schemaName`: The workflow being used
   - `artifacts`: List of artifacts with their status (`done` or other)

   **If any artifacts are not `done`:**
   - Display warning listing incomplete artifacts
   - Prompt user for confirmation to continue
   - Proceed if user confirms

3. **Run verification (required)**

   Run the repo verification command before archiving:
   ```bash
   pnpm test
   ```

   If verification fails, stop and report the failures. Do NOT archive.

4. **Check task completion status**

   Read the tasks file (typically `tasks.md`) to check for incomplete tasks.

   Count tasks marked with `- [ ]` (incomplete) vs `- [x]` (complete).

   **If incomplete tasks found:**
   - Display warning showing count of incomplete tasks
   - Prompt user for confirmation to continue
   - Proceed if user confirms

   **If no tasks file exists:** Proceed without task-related warning.

5. **Perform the archive with spec sync**

   **IMPORTANT:** Do **not** archive by only moving `openspec/changes/<name>` into `openspec/changes/archive/`.
   That leaves delta specs out of `openspec/specs/` and can result in an empty or stale specs directory.

   Preferred command:
   ```bash
   openspec archive <name> -y
   ```

   Rules:
   - `-y` only skips confirmation prompts
   - Do **not** pass `--skip-specs`
   - The archive step MUST sync specs into `openspec/specs/` before the change is archived

   **If the CLI archive command is unavailable or fails for a sync-specific reason:**
   - Stop and report the issue
   - Do **not** fall back to raw `mv` without explicitly syncing specs first

6. **Display summary**

   Show archive completion summary including:
   - Change name
   - Schema that was used
   - Archive location
   - Confirmation that specs were synced into `openspec/specs/`
   - Note about any warnings (incomplete artifacts/tasks)

**Guardrails**
- Always prompt for change selection if not provided
- Use artifact graph (openspec status --json) for completion checking
- Don't block archive on warnings - just inform and confirm
- Always archive via `openspec archive <name> -y` unless the user explicitly asks for a different flow
- Never use raw `mv` alone for `/opsx-archive`
- Never pass `--skip-specs` unless the user explicitly asks for it and accepts the consequence
- Show clear summary of what happened
