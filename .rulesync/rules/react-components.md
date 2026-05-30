---
description: React 19 component patterns — no forwardRef, avoid useEffect, types outside the component
---

# React Components

This project uses React 19 + Next.js 15 App Router.

## Never use `forwardRef`

React 19 passes `ref` as a regular prop. Do not wrap components in `forwardRef`.

## Avoid `useEffect`

`useEffect` is for synchronizing with external systems — not for derived state,
not for fetching on mount, not for setting state from props.

If you reach for `useEffect`, try first:
- **Derived state** — compute it during render, do not store it
- **Event handlers** — put the logic where the event happens
- **Server data** — fetch in a Server Component or with `api.foo.useQuery`

Allowed `useEffect` cases:
- Subscribing to a DOM/browser API (`scroll`, `resize`, clipboard)
- Imperatively syncing with a third-party library
- Cleanup on unmount

## Types outside the component

Define prop types above the component, not inline.

```typescript
type ReportFormProps = {
  onSubmit: (districtId: string, weekEndingDate: string) => void;
  isLoading: boolean;
};

export function ReportForm({ onSubmit, isLoading }: ReportFormProps) {
  // ...
}
```

## Minimal props

Each prop earns its existence:
- If a value can be derived from another prop, do not pass it
- If a boolean prop will multiply states, use a variant instead

## Server Components by default

Every component in `app/` is a Server Component unless it needs client state,
browser APIs, or event handlers.

Mark client components with `"use client"` at the top. Keep the client boundary
as low in the tree as possible.

## Performance defaults

- Avoid derived state stored in `useState` — derive during render instead
- Keep state local to the component that owns it
- Use early returns instead of nested conditionals
