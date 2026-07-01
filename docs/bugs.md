# Known Bugs and Inconsistencies

Catalogued from code exploration. Check this file before modifying any of the named areas. Update status when bugs are fixed.

---

## Bug #1 — Stray literal text in CheckYourEmailPage

**File:** `src/features/auth/pages/CheckYourEmailPage.jsx:42`
**Severity:** Medium (visible text artifact on screen)
**Status:** Open

A bare string ` font-semibold` sits between JSX elements and will render as visible page text (React renders bare strings). Likely a botched className-to-JSX edit.

**Fix:** Remove the stray string literal.

---

## Bug #2 — Camera manage buttons never shown (wrong Redux selector)

**File:** `src/features/cameras/pages/CameraFeedsPage.jsx:15`
**Severity:** High (feature regression — Add/Edit/Delete camera buttons never appear for any user)
**Status:** Open

```js
// Wrong — state.auth.operator does not exist
const role = useSelector(state => state.auth?.operator?.role);
// Correct path
const role = useSelector(state => state.auth?.user?.role?.name);
```

Also see Bug #6 — even after fixing the selector path, `roleUtils.js` uses the wrong role name strings, so `canManageCameras(role)` would still return `false` for the correct canonical role names.

**Fix:** Fix selector + fix roleUtils (see Bug #6).

---

## Bug #3 — useState used instead of useEffect for on-mount logic in SystemTestPage

**File:** `src/features/systemTest/pages/SystemTestPage.jsx:73`
**Severity:** Medium (test runs once on initial render but is semantically wrong; has no cleanup, cannot be re-triggered)
**Status:** Open

```js
// Wrong — useState initializer runs once but is not the right hook for side effects
useState(() => { testBackendConnection(); });
// Correct
useEffect(() => { testBackendConnection(); }, []);
```

**Fix:** Replace `useState` with `useEffect` with empty dependency array.

---

## Bug #4 — Malformed JSX in SystemTestPage

**File:** `src/features/systemTest/pages/SystemTestPage.jsx:137-139`
**Severity:** High (likely causes a runtime/compile error or broken UI output)
**Status:** Open

Unbalanced closing tags and stray `)}` around the backend-status conditional block. The JSX structure is malformed.

**Fix:** Audit and rebalance the closing brackets in the status display block.

---

## Bug #5 — ForgotPassword submits no API call

**File:** `src/features/auth/pages/ForgotPasswordPage.jsx`
**Related:** No `forgotPassword` method exists in `src/services/api.js`
**Severity:** High (feature is completely non-functional)
**Status:** Open

The form `onSubmit` calls `e.preventDefault()` and then navigates directly to `/check-email`. No API call is made. The backend never receives the reset request.

Additionally, `CheckYourEmailPage` and `YouAreAllSetPage` display hardcoded `example@gmail.com` rather than the real user's email.

**Fix:** Add `forgotPassword(email)` to `authAPI` in `api.js`, call it in the page's submit handler, pass the email through navigation state.

---

## Bug #6 — roleUtils.js uses wrong role name strings

**File:** `src/shared/utils/roleUtils.js`
**Severity:** High (breaks any component that uses this utility)
**Status:** Open

```js
// Wrong — these names do not match the canonical role names from the backend
export const CAN_MANAGE_CAMERAS = ['ADMINISTRATOR', 'NODE_MAINTAINER'];

// Canonical names (used everywhere else in the codebase)
// 'admin', 'emergency_dispatcher', 'road_observer', 'node_maintenance_crew'
```

`canManageCameras(role)` will always return `false` for any real user because the comparison strings never match.

**Fix:** Update `CAN_MANAGE_CAMERAS` to use canonical lowercase names: `['admin', 'node_maintenance_crew']`.

---

## Bug #7 — Hardcoded mock data in production UI

**Severity:** Medium (misleading to operators)
**Status:** Partially fixed

Two areas display static placeholder data:

**a) `src/features/dashboard/pages/DashboardPage.jsx`**

- **Top KPI row** (users, nodes online, cameras online, active users): **FIXED** — now pulls from real Redux state via `userAPI.listUsers`, `state.nodes`, and `state.cameras`.
- **Performance metrics row** (API Latency, Message Queue Lag, Uptime, Geo Events/min): Still hardcoded. Needs `GET /api/dashboard/summary` (see `backend-integration-dashboard.md` §1, §3).
- **"Recent Alerts" list**: Still hardcoded. Needs `GET /api/alerts` + `"alert:new"` socket event (see `backend-integration-dashboard.md` §4).

**b) `src/features/auth/pages/TwoFactorAuthPage.jsx`, `CheckYourEmailPage.jsx`, `YouAreAllSetPage.jsx`**

Display `example@gmail.com` instead of the actual user's email. Still unfixed. Fix: pass real email through router state from the login/forgot-password flow.

---

## Bug #8 — console.error used as info log in nodesSlice

**File:** `src/features/nodeMaintainer/nodesSlice.js:361`
**Severity:** Low (cosmetic; creates noise in browser DevTools error console)
**Status:** Open

```js
console.error("🔴 Marking node ... OFFLINE")  // not actually an error
```

**Fix:** Change to `console.log` or `console.warn`, or remove entirely.

---

## Bug #9 — Raw axios bypasses auth refresh interceptor

**Files:**
- `src/features/nodeMaintainer/nodesSlice.js` — node CRUD calls (`GET /nodes`, `POST /nodes/register`, `PATCH /nodes/:id`, `DELETE /nodes/:id`)
- `src/features/incidents/services/incidentDecisionService.js` — `POST /accident-decision`

**Severity:** Medium (silent auth failures on token expiry; no 401 → refresh → retry; `withCredentials` not set)
**Status:** Open

Both files import raw `axios` and call `API_URL` directly, bypassing the configured Axios instance in `src/services/api.js` that has the refresh interceptor and `withCredentials: true`.

**Fix:** Replace raw `axios` calls with the imported `api` instance from `src/services/api.js`.

---

## Inconsistency — Duplicate utility roots

Two utility directories exist with no clear separation:
- `src/utils/` — `egyptianValidation.js`, `toast.js`
- `src/shared/utils/` — `roleUtils.js`

**Impact:** Low (just confusing). Future utilities may end up in the wrong place.
**Fix:** Consolidate into one location (`src/utils/` preferred, matching CLAUDE.md).
