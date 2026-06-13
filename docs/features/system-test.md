# Feature: system-test

**Status:** Partial — has two bugs that prevent correct operation
**Path:** `src/features/systemTest/`
**Redux slice:** None
**Access:** `admin` only

---

## Purpose

Backend connectivity diagnostics page for administrators. Tests whether the frontend can reach the Central Unit API (`/health` and `/test-frontend` endpoints) and displays the result.

---

## Files

```
src/features/systemTest/
  pages/
    SystemTestPage.jsx    — Single page (no sub-components)
```

---

## What it does

On page load, it calls two backend endpoints:
- `GET /health` — Central Unit health check
- `GET /test-frontend` — Frontend-specific connectivity test

Displays a status card for each endpoint: success (green) or error (red) with response details.

---

## Bugs

### Bug #3 — Wrong hook for on-mount effect

**Line 73:** `useState(() => { testBackendConnection(); })` should be `useEffect(() => { testBackendConnection(); }, [])`.

`useState` with an initializer runs the function once during the first render, which technically triggers the call, but:
- There is no cleanup
- React's StrictMode will double-invoke it in development
- It cannot be re-triggered (no dependency tracking)
- It is semantically incorrect

### Bug #4 — Malformed JSX

**Lines 137–139:** Unbalanced closing tags and stray `)}` around the backend-status conditional block. This may cause a compile error or produce broken rendered output.

---

## Fix required

```jsx
// Replace
useState(() => { testBackendConnection(); });

// With
useEffect(() => {
  testBackendConnection();
}, []);
```

Then audit and fix the JSX closing bracket balance in the status display block (lines 137–139).
