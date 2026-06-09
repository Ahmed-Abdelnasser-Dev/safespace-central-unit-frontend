# Feature: profile

**Status:** Completed
**Path:** `src/features/profile/`
**Redux slice:** None — reads `state.auth.user`; calls `updateUserProfile` thunk from authSlice
**Access:** All authenticated roles

---

## Purpose

Operator self-service: view profile, edit personal info, change password, upload photo, view recent activity.

---

## Files

```
src/features/profile/
  pages/
    ProfilePage.jsx              — Main profile page
  components/
    AccountInfoCard.jsx          — Account details (email, role, join date)
    ChangePasswordModal.jsx      — Modal: current + new + confirm password
    EditPersonalInfoModal.jsx    — Modal: name, phone, national ID
    InfoRow.jsx                  — Label + value display row
    PasswordInput.jsx            — Password field with show/hide toggle
    PasswordStrengthSection.jsx  — Password strength indicator
    PersonalInfoCard.jsx         — Personal info display card
    ProfileHeroCard.jsx          — Avatar + name + role banner
    RecentActivityCard.jsx       — Recent operator actions list
    SecuritySettingsCard.jsx     — Security preferences
    UserProfileBody.jsx          — Compose all cards into the page body
```

---

## Data flow

```
state.auth.user → ProfileHeroCard, PersonalInfoCard, AccountInfoCard
  (user: { id, name, email, role, photo, ... })

Edit personal info → updateUserProfile thunk → PATCH /auth/me → setUser(updated)
Change password   → authAPI.changePassword(userId, currentPwd, newPwd) → POST /auth/change-password
Upload photo      → userAPI.updatePhoto(file) → POST /users/me/photo (multipart/form-data)
Recent activity   → local mock data or userAPI.getMe() (verify in source)
```

---

## mustChangePassword enforcement

If an operator's account was newly created (or had its password reset by an admin), `mustChangePassword=true` is set in the auth slice. `ProtectedRoute` redirects any navigation attempt to `/profile` until the password is changed.

`ChangePasswordModal` in the profile handles this flow. On successful change, `mustChangePassword` is cleared.

---

## Known issues

None. `console.error` calls are limited to legitimate catch blocks.
