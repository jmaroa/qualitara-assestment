## 1. Regression tests first

- [x] 1.1 Add a failing UI test proving the page does not show `Loading summary…` before the first submit
- [x] 1.2 Keep or add a loading-state test proving the panel still appears for a real in-flight request after submission

## 2. Page-state fix

- [x] 2.1 Update the admin summary page to distinguish idle from loading using existing local state and query state
- [x] 2.2 Keep empty, error, and success rendering behavior unchanged after a request is submitted

## 3. Verification

- [x] 3.1 Run `pnpm test`
- [x] 3.2 Run `pnpm typecheck`
