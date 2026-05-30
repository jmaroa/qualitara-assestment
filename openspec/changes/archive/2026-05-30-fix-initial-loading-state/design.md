## Context

The admin summary page uses a client-side tRPC query that stays disabled until the user submits the form. Right now the page renders `Loading summary…` based on a query state flag that is also true before the first request has ever run, so a fresh page load incorrectly looks like an active fetch.

## Goals / Non-Goals

**Goals:**
- Distinguish the pre-submit idle state from a real loading state
- Prevent the loading panel from appearing on first load or reload before any request is submitted
- Preserve explicit loading, empty, error, and success states after a request is actually made
- Add regression tests for idle vs loading behavior

**Non-Goals:**
- Change backend summary behavior or request semantics
- Redesign the page layout beyond state handling and any minimal copy needed for the idle state
- Introduce a broader query-state abstraction

## Decisions

- **Idle state is explicit:**
  - Before the first submit, the page is in an idle state, not a loading state.
  - The loading panel should only appear after a request has been submitted and is actively in flight.

- **State gating stays local to the page component:**
  - Keep the fix inside the admin page component instead of introducing new shared abstractions.
  - Use existing local state (`submittedInput`) as part of the source of truth for whether a request has started.

- **Tests focus on real failure modes:**
  - Add a regression test for first load/reload showing no loading panel.
  - Keep a separate test proving that a true in-flight request still shows the loading panel.

## Risks / Trade-offs

- **Risk:** Switching query flags without considering disabled-query behavior could hide real loading states → **Mitigation:** gate loading on both submission state and active query state, and cover both paths with tests.
- **Trade-off:** This keeps some state logic in the page component, but that is acceptable here because the bug is local and the project prefers simplicity over new abstractions.
