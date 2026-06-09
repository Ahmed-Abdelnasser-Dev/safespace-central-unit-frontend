# Feature: auth

**Status:** Completed (partial — forgot-password flow is a UI stub with no API call)
**Path:** `src/features/auth/`
**Redux slice:** `authSlice.js` — registered in store as `auth`

---

## Purpose

Handles all authentication flows: login, MFA, must-change-password, session refresh, logout, and the forgot-password UI (stub only).

---

## Files

```
src/features/auth/
  pages/
    SignInPage.jsx           — Login form (email + password)
    TwoFactorAuthPage.jsx    — 6-digit OTP entry with auto-submit
    ForgotPasswordPage.jsx   — "Enter email to reset" form (no API call — see bugs)
    CheckYourEmailPage.jsx   — Confirmation screen after forgot-password
    YouAreAllSetPage.jsx     — Post-change success screen (auto-redirects to / after 3s)
  components/
    LoginLayout.jsx          — Outer layout wrapper for auth pages
    LoginLeftPanel.jsx       — Left branding panel
    LoginRightPanel.jsx      — Right form panel
  authSlice.js               — Redux slice (state + thunks)
```

---

## Redux state shape (`state.auth`)

```js
{
  user: null | { id, name, email, role: { name }, photo, ... },
  isAuthenticated: boolean,
  loading: boolean,          // login / fetchCurrentUser
  loadingRefresh: boolean,   // refreshSession (gates app render on startup)
  error: string | null,
  mustChangePassword: boolean,
  mfaRequired: boolean,
  pendingMfaUserId: string | null,
}
```

Session is persisted to `sessionStorage.user` (rehydrated on reload). `isAuthenticated` is derived from the presence of `sessionStorage.user` — no token validation on the frontend.

---

## Thunks

| Thunk | API call | Purpose |
|-------|---------|---------|
| `loginUser(email, password, rememberMe)` | `POST /auth/login` | Branches on: mustChangePassword / mfaRequired / success |
| `refreshSession()` | `POST /auth/refresh` | Silent session rehydration on app startup |
| `fetchCurrentUser()` | `GET /auth/me` | Reload user profile from server |
| `logoutUser()` | `POST /auth/logout` | Server logout + clear Redux + sessionStorage |
| `verifyMFACode(userId, code, rememberMe)` | `POST /auth/mfa/verify` | Complete MFA login |
| `updateUserProfile(updates)` | `PATCH /auth/me` | Update name/photo from profile page |

---

## Login flow (detailed)

```
SignInPage
  → dispatch(loginUser)
  → response.mustChangePassword  → store user, mustChangePassword=true
                                    ProtectedRoute forces /profile
  → response.mfaRequired         → stash pendingMfaUserId in sessionStorage
                                    navigate('/two-factor')
  → success                      → store user → RoleRedirect to defaultPath

TwoFactorAuthPage
  → reads pendingMfaUserId from sessionStorage
  → 6-digit auto-submit on digit 6
  → dispatch(verifyMFACode) → store user → navigate('/')

ForgotPasswordPage
  → submit: NO API CALL — just navigates to /check-email ← BUG #5
```

---

## Sync actions

- `clearError()` — clear error state (used between page navigations)
- `setUser(user)` — directly set user (used after profile updates)
- `clearAuth()` — full logout (clear user + sessionStorage)

---

## Known issues

| # | Issue |
|---|-------|
| [Bug #1](../bugs.md) | `CheckYourEmailPage.jsx:42` — stray literal ` font-semibold` renders as visible text |
| [Bug #5](../bugs.md) | `ForgotPasswordPage` submits no API call; `CheckYourEmailPage`/`YouAreAllSetPage` show `example@gmail.com` |
| — | `TwoFactorAuthPage` "Resend Code" button has no `onClick` handler |
| — | `YouAreAllSetPage` is unwired — no route guard; simply auto-redirects to `/` after 3s |
