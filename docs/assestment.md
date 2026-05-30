# Take-Home Project Internal Tools Prompt

You are joining a small internal-tools team at an EdTech company. The Customer Success team is overwhelmed by a recurring class of inbound support tickets: school district admins asking for per-school usage reports for the prior week.

Build a small TypeScript + Node application that:

1. Reads from a provided CSV (or seeded SQLite/Postgres database — your choice) of teacher usage events (`teacher_id`, `school_id`, `district_id`, `event_type`, `timestamp`).
2. Exposes an HTTP endpoint that returns a per-school weekly summary for a given `district_id` and a given week-ending date. The summary should include: active teachers, total events, top 3 event types, and a per-school breakdown.
3. Includes a small admin UI (Next.js preferred but not required) where a CSM user can enter a `district_id`, pick a week-ending date, and view the summary. The UI should render the per-school breakdown as a readable, scannable table sortable by at least one column (e.g., active teachers or total events); explicitly handle loading, empty (no data for that district/week), and error (invalid `district_id` / failed request) states, not just the happy path; and present the result in a form a CSM could hand to a district admin with minimal cleanup (e.g., a "copy summary" affordance or a print-friendly layout). Polish should match an internal tool, not a marketing page — UX judgment over pixel perfection.
4. Includes at least one test that catches a real failure mode you anticipated.
5. Includes a short README that explains: how to run it, your design choices and trade-offs, what you would build in v2, what you would change if this were going to production, and how you used AI tools (which prompts / which decisions you delegated, which you didn't, and why).
6. Includes **at least one ADR (Architecture Decision Record)** in a `docs/adr/` folder, documenting a meaningful design decision you made on this project (e.g., data store choice, aggregation strategy, API shape, UI framework, auth approach). Use the standard ADR format: Context, Decision, Consequences, Alternatives Considered. One is the minimum; add more if you made more than one decision worth recording.
7. Includes an **`ai-sessions/`** folder at the repo root containing exported logs from any AI tools you used during this project. We will read these closely — they're how we evaluate AI fluency.

You may use any AI tool you'd normally use. There is no penalty for AI usage; what we evaluate is **how** you use it.

## Submission

Reply to the original email containing this brief with a link to your public GitHub repository (or equivalent public Git host — GitLab, Bitbucket, etc.). The repository must contain:

- The project code, runnable per the README
- A `README.md` covering everything in point 5 above
- A `docs/adr/` folder with at least one ADR
- An `ai-sessions/` folder with your AI conversation exports

**Exporting AI sessions:**

- **Claude (claude.ai):** Open the conversation → use *File → Print → Save as PDF*, or copy the full conversation and save as a `.md` file (e.g., `ai-sessions/claude-data-model.md`).
- **ChatGPT:** Open the conversation → top-right menu (···) → *Share* → copy the link **and** paste the full text into a `.md` file for the repo.
- **Cursor (AI Chat panel):** Right-click the chat history → *Copy All* and save as a `.md` file.
- **GitHub Copilot Chat (VS Code):** Click the *Export Chat* icon in the Copilot Chat panel; commit the resulting `.md` file under `ai-sessions/`.
- **Any other tool:** Copy and paste the full conversation into a descriptively named `.md` file (e.g., `ai-sessions/perplexity-supabase-research.md`).

**You will walk through your submission live with a Qualitara engineer in the next stage.** Be prepared to defend every meaningful decision, explain any code that came from AI assistance line by line, walk us through your ADR(s), and discuss what you would change with more time.