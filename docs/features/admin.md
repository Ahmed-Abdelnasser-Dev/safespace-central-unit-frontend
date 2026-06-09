# Feature: admin

**Status:** Completed
**Path:** `src/features/admin/`
**Redux slice:** None — uses local state + `userAPI` / `activityLogsAPI` directly
**Access:** `admin` role only

---

## Purpose

Operator management and audit log viewing for the Administrator role.

---

## Files

```
src/features/admin/
  pages/
    UserManagementPage.jsx   — Full CRUD for operator accounts
    ActivityLogsPage.jsx     — Audit log viewer with table + summary cards
  components/
    CreateUserModal.jsx      — Modal form to create a new operator account
    EditAccountInfoModal.jsx — Modal form to edit role/status/permissions
    UserActivityTable.jsx    — Table of recent activity for a selected user
    UserManagementButtons.jsx — Action button group (edit, deactivate, delete)
    UserManagementCards.jsx  — Summary stat cards (total users, active, by role)
    UserManagementHeader.jsx — Page header with search + role/status filters
    UserManagementTable.jsx  — Main operator list table
```

---

## User Management (`UserManagementPage`)

Full CRUD for operator accounts with the following capabilities:
- Search by name/email
- Filter by role and status
- Pagination
- Create new operator (modal)
- Edit role / account info (modal)
- Deactivate / reactivate account
- Delete account
- Admin role gate: non-admins see an "Access Denied" view (defense-in-depth beyond route RBAC)

**API methods used** (from `userAPI` in `src/services/api.js`):
- `listUsers(params)` — paginated, with search/role/status filters
- `createUser(data)`
- `updateUser(id, updates)`
- `deactivateUser(id)` / `reactivateUser(id)`
- `deleteUser(id)`

All data is managed in local component state (no Redux slice). `useState` + `useEffect` pattern.

---

## Activity Logs (`ActivityLogsPage`)

Audit log viewer that composes `UserManagementCards` (summary counts) and `UserActivityTable` (log entries with user, action, timestamp, metadata).

**API method:** `activityLogsAPI.getLogs(params)` → `GET /activity-logs`

---

## Known issues

None. `console.error` calls are limited to legitimate catch blocks.
