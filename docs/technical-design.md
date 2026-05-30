# Technical Design Document — District Usage Reports

## 1. Overview

An internal tool for the Customer Success team at an EdTech company.
CSM users enter a `district_id` and a week-ending date to generate per-school
weekly usage summaries, reducing the manual work of handling district admin
support tickets.

---

## 2. Problem Statement

School district admins repeatedly request per-school usage reports for the
prior week. Each request requires a CSM to manually query data and format a
response. This tool automates the query and presents a shareable summary.

---

## 3. Technology Stack

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| **Framework** | Next.js (App Router, RSC) | 15.x | Full-stack React with SSR, API routes, file-based routing |
| **Language** | TypeScript | 5.x | Strict mode, no `any`, Zod at boundaries |
| **API (internal)** | tRPC v11 + superjson | 11.x | Type-safe RPC between client and server, no codegen |
| **Data store** | SQLite | — | Zero-config, single-file, sufficient for assessment scope |
| **ORM / Query** | TBD (raw `better-sqlite3` or Drizzle) | — | Decision deferred — will be recorded in ADR-0001 |
| **UI** | Tailwind CSS v4 + shadcn/ui (new-york, neutral) | 4.x | Utility-first CSS with accessible component primitives |
| **Icons** | lucide-react | 0.460+ | Consistent with shadcn/ui icon library |
| **Validation** | Zod | 4.x | Runtime validation at API boundaries |
| **Testing** | Vitest + Testing Library | 4.x / 16.x | Fast unit tests with React component testing |
| **Package manager** | pnpm | 10.x | Fast installs, strict dependency resolution |
| **Agentic dev** | OpenSpec + Rulesync | 1.3+ / 6.2+ | Spec-driven development with AI agent orchestration |

---

## 4. Architecture

```
┌─────────────────────────────────────────────────┐
│                  Next.js App                     │
│                                                  │
│  ┌──────────────┐    ┌────────────────────────┐  │
│  │  Admin UI     │    │  API Layer             │  │
│  │  (React RSC)  │───▶│  tRPC Router           │  │
│  │  /reports     │    │  GET /api/trpc/...     │  │
│  └──────────────┘    └───────────┬────────────┘  │
│                                  │                │
│                      ┌───────────▼────────────┐  │
│                      │  Service Layer          │  │
│                      │  server/services/       │  │
│                      │  - usage aggregation    │  │
│                      │  - date/week math       │  │
│                      └───────────┬────────────┘  │
│                                  │                │
│                      ┌───────────▼────────────┐  │
│                      │  Data Layer             │  │
│                      │  SQLite (local file)    │  │
│                      │  lib/db/                │  │
│                      └────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 4.1 Layer Responsibilities

- **UI Layer** (`app/`): React Server Components + client components for
  interactivity. Handles form input, loading/empty/error states, table
  rendering with sorting, copy/print affordances.

- **API Layer** (`server/routers/`): tRPC router with `publicProcedure`
  (no auth for this assessment). Accepts `districtId` + `weekEndingDate`,
  validates with Zod, delegates to service layer.

- **Service Layer** (`server/services/`): Pure business logic. Computes
  week boundaries from a week-ending date, aggregates usage events,
  produces the summary shape. No framework dependencies — fully testable.

- **Data Layer** (`lib/db/`): SQLite connection, seed script, query
  functions. Reads from a local `.sqlite` file seeded from CSV or script.

### 4.2 Data Model

Single table for usage events:

```
usage_events
├── id          INTEGER PRIMARY KEY
├── teacher_id  TEXT NOT NULL
├── school_id   TEXT NOT NULL
├── district_id TEXT NOT NULL
├── event_type  TEXT NOT NULL
└── timestamp   TEXT NOT NULL (ISO 8601)
```

Indexes: `(district_id, timestamp)` for the primary query path.

### 4.3 API Contract

**tRPC Procedure:** `reports.weeklyDistrictSummary`

**Input:**
```typescript
{
  districtId: string;       // Required, non-empty
  weekEndingDate: string;   // ISO date (YYYY-MM-DD), must be valid
}
```

**Output:**
```typescript
{
  districtId: string;
  weekStarting: string;     // ISO date
  weekEnding: string;       // ISO date
  summary: {
    totalActiveTeachers: number;
    totalEvents: number;
    topEventTypes: Array<{ eventType: string; count: number }>;  // Top 3
  };
  schools: Array<{
    schoolId: string;
    activeTeachers: number;
    totalEvents: number;
    topEventTypes: Array<{ eventType: string; count: number }>;
  }>;
}
```

---

## 5. UI Design

Single-page admin tool at `/` (or `/reports`):

1. **Input form**: `district_id` text field + date picker for week-ending date
2. **Summary card**: District-level totals (active teachers, total events, top 3 types)
3. **School breakdown table**: Sortable by active teachers or total events
4. **Affordances**: "Copy Summary" button (clipboard-friendly text) + print-friendly layout
5. **States**: Loading skeleton, empty state (no data), error state (invalid input / failed request)

---

## 6. Testing Strategy

| Layer | Tool | What to test |
|---|---|---|
| Service logic | Vitest | Week boundary computation, aggregation correctness, edge cases (empty data, single event, cross-midnight timestamps) |
| tRPC router | Vitest + caller | Input validation (invalid district, bad date format), response shape |
| UI components | Vitest + Testing Library | Render states (loading, empty, error, data), sort toggle |

Priority: at least one test that catches a **real failure mode** (e.g., off-by-one
in week boundary calculation, timezone edge case, empty district returning 200
with no schools instead of a clear "no data" response).

---

## 7. Project Structure

```
qualitara-assestment/
├── app/
│   ├── api/trpc/[trpc]/route.ts   # tRPC HTTP handler
│   ├── globals.css                 # Tailwind v4 theme
│   ├── layout.tsx                  # Root layout with TRPCReactProvider
│   └── page.tsx                    # Main reports UI
├── components/
│   └── ui/                         # shadcn/ui primitives (added via CLI)
├── lib/
│   ├── db/                         # SQLite connection + seed (TBD)
│   ├── trpc/
│   │   ├── init.ts                 # tRPC context, procedures
│   │   ├── client.tsx              # React client provider
│   │   └── server.ts              # RSC server caller
│   ├── env.ts                      # Zod-validated env vars
│   └── utils.ts                    # cn() utility
├── server/
│   ├── routers/
│   │   └── index.ts               # appRouter
│   └── services/                   # Business logic (aggregation)
├── docs/
│   ├── technical-design.md         # This document
│   └── adr/                        # Architecture Decision Records
├── ai-sessions/                    # Exported AI conversation logs
├── openspec/                       # Spec-driven dev (OpenSpec)
│   ├── config.yaml
│   ├── specs/
│   └── changes/
├── .rulesync/                      # Agentic dev rules (Rulesync)
├── package.json
├── tsconfig.json
├── next.config.ts
├── vitest.config.ts
├── vitest.setup.ts
├── postcss.config.mjs
├── components.json                 # shadcn/ui config
└── README.md                       # How to run + design choices
```

---

## 8. Key Design Decisions (ADRs to Write)

| # | Decision | Status |
|---|---|---|
| ADR-0001 | Data store: SQLite with `better-sqlite3` (or Drizzle) | Pending |
| ADR-0002 | Aggregation strategy: query-time vs materialized | Pending |
| ADR-0003 | API shape: tRPC vs REST route handler | Optional |

---

## 9. What v2 Would Include

- Authentication (CSM login)
- Persistent PostgreSQL with proper migrations
- Scheduled report generation (cron / background job)
- Export to PDF/CSV
- District-level comparison across weeks (trend data)
- Caching layer for repeated queries
- Rate limiting on the API

---

## 10. Configuration Checklist

Before first run:

- [ ] `pnpm install`
- [ ] Set up SQLite database + seed data
- [ ] Add shadcn/ui components: `table`, `button`, `input`, `card`, `select`
- [ ] Verify `pnpm dev` starts on localhost:3000
- [ ] Verify `pnpm test` runs green
