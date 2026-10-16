<!-- Generated: 2026-10-16 | Files scanned: 62 | Token estimate: ~3600 -->
# Identity & access codemap (web)

Scope: FE features `auth`, `users`, `roles`, `departments`, `positions` plus the login/session/permission plumbing in `src/lib`. BE twin: `be-quanlysanxuat/docs/CODEMAPS/identity-access.md`. Screens: `docs/ui-flow.md` (its sidebar section is stale for this group, see section 5). Platform view: `architecture.md`.

## 1. Features
| Feature folder | Role | Screens (pages/) | Types & status labels | Schemas |
|---|---|---|---|---|
| `auth` | Login form, session/profile/permission reads, logout hook, idle-tab watchdog | `LoginPage`, `AuthLayout` | `src/lib/types/login.type.ts`, `session.type.ts`, `permission.type.ts` | `login.schema.ts` (+ `loginSearchSchema` `redirectTo`) |
| `users` | Staff list/create/update, Excel export, `userOptions` picker for other features | `UsersPage`, `CreateUserPage`, `UpdateUserPage` | `user.type.ts` (`EmployeeStatus` WORKING "Đang làm việc" / RESIGNED "Đã nghỉ việc") | `users-search`, `create-user`, `update-user` |
| `roles` | Role CRUD + permission catalogue grid | `RolesPage`, `CreateRolePage`, `UpdateRolePage` | `role.type.ts` (`isSystem`), `permission.type.ts` (87 codes) | `create-role`, `update-role`; `constants/permission-blocks.ts` |
| `departments` | Department list/detail, owns position CRUD (dialogs on the detail page) | `DepartmentsPage`, `DepartmentDetailPage` | `department.type.ts` (`isActive`), `position.type.ts` | `departments-search`, `create/update-department`, `update-department-status`, `create/update-position` |
| `positions` | api-only: `positionOptionsQueryOptions(departmentId)` for the user form | none | `position.type.ts` | none |

Cross-feature barrels: `users/api` exports `userOptionsQueryOptions`, `useGetUserOptions`, `usersQueryOptions`; `roles/api` exports `rolesQueryOptions`; `departments/api` exports `departmentQueryOptions` (unfiltered options, used by iqc, purchase-requests, users); `auth/api` exports `currentUserQueryOptions`, `currentPermissionsQueryOptions`, `useLogout`.

## 2. Screens
Gate = entry in `src/lib/route-permissions.ts` (checked in `(authed)/route.tsx` beforeLoad, see 4b). `bg` = fire-and-forget preload.
| UI route (URL) | Route file | Page component | Loader preloads | Permission gate | Reached from |
|---|---|---|---|---|---|
| `/login?redirectTo=` | `src/routes/(auth)/login.tsx` | `LoginPage` (in `(auth)/route.tsx` layout `AuthLayout`) | none | public | `requireSession` redirect, watchdog redirect, logout |
| `/` | `src/routes/index.tsx` | redirect to `/manage` | none | none | direct URL |
| `/manage/users` | `manage_/users/index.tsx` (+`route.tsx` PageTitleBar layout) | `UsersPage` | `users` | `users:update` (no `users:read` exists in BE catalogue) | sidebar "Nhân sự" (group "Hệ thống") |
| `/manage/users/create` | `manage_/users_/create/index.tsx` | `CreateUserPage` | `department`, `positionOptions`, `roles` | `users:create` | "Thêm nhân sự" |
| `/manage/users/$userId/update` | `manage_/users_/$userId.update.tsx` | `UpdateUserPage` | `department`, `positionOptions`, `user`, `roles` | `users:update` | row icon "Chỉnh sửa" |
| `/manage/roles` | `manage_/roles/index.tsx` | `RolesPage` | `roles` | `roles:read` | sidebar "Phân quyền" |
| `/manage/roles/create` | `manage_/roles_/create.tsx` | `CreateRolePage` | `permissionCatalogue` | `roles:create` | "Tạo vai trò" |
| `/manage/roles/$roleId/update` | `manage_/roles_/$roleId.update.tsx` | `UpdateRolePage` | `permissionCatalogue`, `role` | `roles:update` | row icon "Chỉnh sửa" |
| `/manage/departments` | `manage_/departments/index.tsx` | `DepartmentsPage` | `departments` | `departments:read` | sidebar "Phòng ban" |
| `/manage/departments/$departmentId` | `manage_/departments_/$departmentId.tsx` | `DepartmentDetailPage` | `departmentDetail` | `departments:read` | row icon "Xem chi tiết" |

Dialogs, not routes: create/update/delete department (`CreateDepartmentDialog` "Thêm phòng ban", `UpdateDepartmentDialog`, `DeleteDepartmentDialog`) and positions (`CreatePositionDialog` "Thêm chức vụ", update, delete). Delete role: `DeleteRoleDialog` from the row icon "Xóa".

## 3. Actions -> endpoints
Server fn folder: `src/features/<feature>/api/server-functions/`. BE paths are in `be-quanlysanxuat/`. Call goes `createServerFn` -> `http` -> BE (see `architecture.md`).

**auth**
| Action / trigger | Server fn | Endpoint | Permission | BE handler |
|---|---|---|---|---|
| Login form submit | `login-with-email-password.api.ts` | POST /api/auth/login | public | `AuthController.login` (`src/api/auth/auth.controller.ts:23`) |
| User menu "Đăng xuất" (`PageTitleBar`) | `logout.api.ts` | POST /api/auth/logout | JWT | `AuthController.logout` (`auth.controller.ts:42`) |
| `(authed)` beforeLoad, sidebar, gates | `get-current-permissions.api.ts` | GET /api/users/me/permissions | JWT | `UsersController.getCurrentPermissions` (`src/api/users/users.controller.ts:56`) |
| `(authed)` beforeLoad, `PageTitleBar` profile | `get-current-profile.api.ts` | GET /api/users/me | JWT | `UsersController.getCurrentUser` (`users.controller.ts:43`) |
| beforeLoad, watchdog | `get-current-session.api.ts` | none (reads cookie; may call refresh, see 4a) | n/a | n/a |

**users**
| Action / trigger | Server fn | Endpoint | Permission | BE handler |
|---|---|---|---|---|
| List/filter table | `get-users.api.ts` | GET /api/users | `users:update` | `UsersController.getUsers` (`users.controller.ts:69`) |
| Update page loader | `get-user.api.ts` | GET /api/users/:userId | `users:update` | `getUser` (`:105`) |
| Person pickers | `get-user-options.api.ts` | GET /api/users/options | JWT | `getUserOptions` (`:82`) |
| "Xuất Excel" | `export-users.api.ts` | GET /api/users/export | `users:update` | `exportUsers` (`:95`) |
| Create form submit | `create-user.api.ts` | POST /api/users | `users:create` | `createUser` (`:115`) |
| Update form submit | `update-user.api.ts` | PATCH /api/users/:userId | `users:update` | `updateUser` (`:128`) |

**roles**
| Action / trigger | Server fn | Endpoint | Permission | BE handler |
|---|---|---|---|---|
| Roles list, role select in user form | `get-roles.api.ts` | GET /api/roles | `roles:read` | `RolesController.getRoles` (`src/api/roles/roles.controller.ts:37`) |
| Permission grid | `get-permission-catalogue.api.ts` | GET /api/roles/permissions | `roles:read` | `getPermissionCatalogue` (`:48`) |
| Update page loader | `get-role.api.ts` | GET /api/roles/:roleId | `roles:read` | `getRole` (`:58`) |
| Create form | `create-role.api.ts` | POST /api/roles | `roles:create` | `createRole` (`:68`) |
| Update form | `update-role.api.ts` | PATCH /api/roles/:roleId | `roles:update` | `updateRole` (`:81`) |
| "Xóa" | `delete-role.api.ts` | DELETE /api/roles/:roleId | `roles:delete` | `deleteRole` (`:95`) |

**departments** (positions server fns live here except the read)
| Action / trigger | Server fn | Endpoint | Permission | BE handler |
|---|---|---|---|---|
| List / options | `get-departments.api.ts` | GET /api/departments | public | `DepartmentsController.getDepartments` (`src/api/departments/departments.controller.ts:35`) |
| Detail loader | `get-department.api.ts` | GET /api/departments/:departmentId | public | `getDepartment` (`:46`) |
| "Thêm phòng ban" | `create-department.api.ts` | POST /api/departments | `departments:create` | `createDepartment` (`:58`) |
| Edit dialog | `update-department.api.ts` | PATCH /api/departments/:departmentId | `departments:update` | `updateDepartment` (`:70`) |
| Row Switch (active) | `update-department-status.api.ts` | PATCH /api/departments/:departmentId | `departments:update` | `updateDepartment` (`:70`) |
| "Xóa" | `delete-department.api.ts` | DELETE /api/departments/:departmentId | `departments:delete` | `deleteDepartment` (`:83`) |
| "Thêm chức vụ" | `create-position.api.ts` | POST /api/positions | `positions:create` | `PositionsController.createPosition` (`src/api/positions/positions.controller.ts:46`) |
| Edit position | `update-position.api.ts` | PATCH /api/positions/:positionId | `positions:update` | `updatePosition` (`:56`) |
| Delete position | `delete-position.api.ts` | DELETE /api/positions/:positionId | `positions:delete` | `deletePosition` (`:69`) |
| Position select (by department) | `get-positions.api.ts` (in `src/features/positions/`) | GET /api/positions | public | `getPositions` (`:34`) |

## 4. UI state flow
### 4a. Login, session, refresh, logout
```
LoginForm (useMutation) -> loginWithEmailPassword -> POST /api/auth/login {identifier,password}
   <- {userId, accessToken, refreshToken}; session.update(...) into httpOnly cookie "app-session"
      (tokenExpires = jwt exp; sessionExpires = login + 7d, absolute, never extended; persist flag kept in the cookie so a refresh keeps a browser-session cookie when "keepSignedIn" is unticked)
   onSuccess: queryClient.clear() -> router.invalidate() -> navigate(resolveInternalRedirect(redirectTo) | /manage)

/login: beforeLoad redirectIfAuthenticated (fresh getCurrentSession, staleTime 0) -> valid session -> redirect resolveInternalRedirect(redirectTo | /manage)

any navigation into (authed): beforeLoad  [document sent with Cache-Control: private, no-store]
   requireSession -> currentSessionQueryOptions (staleTime "static") -> getCurrentSession
        token within 60s of exp + refreshToken present -> refreshAccessToken()
        no userId or tokenExpires <= now -> throws -> redirect /login?redirectTo=<href>
   then permissions + profile queries -> requireRoutePermissions

any server fn -> http (axios) request interceptor adds Bearer from session
   BE 401 (not /api/auth/*, first time) -> refreshAccessToken() -> POST /api/auth/refresh -> replay once
   refresh fails -> original 401 surfaces; fn maps it to its own message; next watchdog tick/navigation bounces to /login

useSessionWatchdog (in AuthedLayout): getCurrentSession every 5 min + on window focus; error -> toast
   "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại." + navigate /login?redirectTo

"Đăng xuất" -> useLogout -> logout fn -> POST /api/auth/logout (failure ignored) -> session.clear()
   onSettled: queryClient.clear() -> router.invalidate() -> /login (always)
```
Refresh details (`src/lib/access-token.server.ts`): own interceptor-free axios (`refreshClient`), one in-flight refresh per session key (`userId`) so parallel 401s share one call (BE rotates the refresh token). The BE refresh and role-assign routes show no server-fn caller because refresh is called from `lib`, not from a feature server fn (see 5).

### 4b. Permission model (UI side)
- Source of truth: `PermissionCode` union + `PERMISSION_CODES` in `src/lib/types/permission.type.ts` (87 codes, identical set to BE `src/constants/permission.constant.ts` when checked 2026-10-16). `SUPER_PERMISSION = "system:manage"`.
- Effective codes come from GET /api/users/me/permissions (`currentPermissionsQueryOptions`, key `["auth","permissions"]`, `no-store`). Saving a role invalidates that key (`UpdateRoleForm`), so sidebar and gates update without reload.
- `hasPermission(granted, required)` (`src/lib/permissions.ts`): superadmin passes; otherwise ALL required codes must be held (mirrors BE `PermissionsGuard`).

| Layer | Mechanism | Where | On deny |
|---|---|---|---|
| Route | `routePermissions: Record<ManageRoutePath, code \| null>` (exhaustive, typecheck fails when a `/manage/*` route has no entry); `requireRoutePermissions(permissions, matches)` ANDs the codes of every matched route | `src/lib/route-permissions.ts`, `src/features/auth/api/guard.ts`, `(authed)/route.tsx` beforeLoad | redirect `/manage` (so `/manage` must stay `null`) |
| Dashboard | extra beforeLoad in `src/routes/(authed)/manage.tsx` | no `reports:read` -> `firstReadableRoute(permissions)` (first plain `:read` list route) | redirect; page also wraps content in `PermissionGate reports:read` |
| Sidebar | `AppSidebar.menuGroups` filtered by `canAccessRoute(href, permissions)`; empty groups hidden. `/manage` follows `reports:read`; `/manage/settings` needs `items:read` or `operations:read` | `src/components/shared/layouts/AppSidebar.tsx` | item hidden |
| Button/link to a route | `<RoutePermissionGate route="/manage/users/create">` (same map as the router, cannot drift) | `src/components/shared/primitives/RoutePermissionGate.tsx` | `fallback` or nothing |
| Button/action | `<PermissionGate permission="roles:delete">` or hook `useHasPermission(code)` | `PermissionGate.tsx`, `src/hooks/use-permissions.ts` | `fallback` or nothing |

While `/me/permissions` is still loading, hooks use `[]`, so gates render closed until data arrives. The BE guard stays the real enforcement; UI gates only hide controls. Units reuse `items:*`, and "Công đoạn" uses `operations:*` (see `architecture.md` for the whole route tree).

### 4c. Entity states
| Entity | Values | Changed by | Server fn |
|---|---|---|---|
| User `status` | WORKING, RESIGNED | status field on create/update form (select) | `create-user` / `update-user` |
| User `credentialEnabled` | boolean | field `credential.credentialEnabled` in `UpdateUserCredentialSection` | `update-user` |
| Department `isActive` | true/false | row Switch (disabled without `departments:update`, tooltip "Bạn không có quyền sửa phòng ban") | `update-department-status` |
| Role `isSystem` | read-only flag | none; `UpdateRoleForm` disables fields and save | n/a |

## 5. Gaps and quirks
- POST /api/auth/refresh: called only from `src/lib/access-token.server.ts:38` (`requestRefresh`), triggered by the `http.ts` 401 interceptor and by `getCurrentSession`; not a server fn. Verified by grep of `auth/refresh` in `src`.
- PATCH /api/users/:userId/role: no FE caller anywhere in `src`. Role assignment goes through `roleId` inside POST /api/users and PATCH /api/users/:userId (`create-user.schema.ts:24`, `update-user.schema.ts:34`). The "Phân quyền" icon button in `UsersTableColumns.tsx` (gated `roles:update`) has no `onClick`: it is a stub.
- BE-only identity routes used elsewhere: none. All 26 other auth/users/roles/departments/positions routes are matched.
- `requireSession` reads the cached session with `staleTime: "static"`, so ordinary navigation does not re-validate it; expiry is caught by the 401 interceptor, the 5-minute watchdog and window focus.
- BE GET /departments and /positions are public, but FE routes still require `departments:read`.
- `docs/ui-flow.md` is stale here: it lists "Phân quyền" as `devOnlyRoutes`/F4 (no such code now; sidebar filters by permission), uses `/manage/units`, `/manage/materials`, `/manage/inventory-materials` (now `/manage/settings/units`, `/manage/directs`, `/manage/inventory-directs`) and lacks "Phòng ban" `/manage/departments`.
