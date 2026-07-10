# Contract: User Server Functions

**Feature**: 001-user-management-ui | **Date**: 2026-07-10

The UI's only data interface. Implemented in `src/features/users/server-functions/users.ts` with TanStack Start `createServerFn`, each validating input via `.validator(zodSchema)` and returning `Promise<ActionResult<T>>` (see [data-model.md](../data-model.md)). **No function throws to the client**; every failure is a returned `{ ok: false, error }` with a Vietnamese message. Server functions call the `UserRepository` seam only — in the fake phase the repository is the seeded in-memory store; later it delegates to the shared `http` client against the real backend **without changing any signature below**.

Types referenced: `User`, `UserListQuery`, `PaginatedUsers`, `ActivityLogEntry`, `UserInput` (User minus `id`, from `user-form-schema.ts`).

## listUsers

- **Input**: `UserListQuery` — page, pageSize, q, department, position, status, gender, hiredFrom/hiredTo. Plus `forExport?: boolean`.
- **Output**: `ActionResult<PaginatedUsers>`; when `forExport` is true, `items` contains **all** filtered rows and pagination fields echo the full count.
- **Behavior**: AND-combined filtering; `q` matched diacritic/case-insensitively against fullName, email, phone, code (R4); requested page clamped to the last valid page and the clamped value echoed back; deterministic sort by `code` ascending.
- **Errors**: none expected in fake phase beyond the generic `default` mapping ("Không thể tải danh sách nhân sự. Vui lòng thử lại.").

## getUser

- **Input**: `{ id: string }`
- **Output**: `ActionResult<{ user: User }>`
- **Errors**: unknown id → "Không tìm thấy nhân sự." (drives the deleted-while-selected edge case: panel shows placeholder).

## createUser

- **Input**: `UserInput` (all User fields except `id`; `code` included)
- **Output**: `ActionResult<{ user: User }>`
- **Behavior**: validates via the shared form schema; enforces unique `code`; defaults `status` to `"active"` if omitted; writes a `created` activity-log entry.
- **Errors**: duplicate code → "Mã nhân viên đã tồn tại."; validation failure → field-level (client) plus server-side re-check → "Dữ liệu không hợp lệ."; default → "Không thể tạo nhân sự. Vui lòng thử lại."

## updateUser

- **Input**: `{ id: string } & UserInput`
- **Output**: `ActionResult<{ user: User }>`
- **Behavior**: unique-code check excludes self; writes `updated` (or `status_changed`) log entries describing the diff.
- **Errors**: unknown id → "Không tìm thấy nhân sự."; duplicate code → "Mã nhân viên đã tồn tại."; default → "Không thể cập nhật nhân sự. Vui lòng thử lại."

## deleteUser

- **Input**: `{ id: string }`
- **Output**: `ActionResult<{ id: string }>`
- **Behavior**: writes a `deleted` log entry (fake phase: log removed with the user; harmless), removes the record.
- **Errors**: unknown id → "Không tìm thấy nhân sự."; default → "Không thể xóa nhân sự. Vui lòng thử lại."

## listUserActivity

- **Input**: `{ userId: string }`
- **Output**: `ActionResult<{ entries: ActivityLogEntry[] }>` — newest first.
- **Errors**: unknown id → "Không tìm thấy nhân sự."

## listReferenceData

- **Input**: none
- **Output**: `ActionResult<{ departments: string[]; positions: string[] }>` — feeds filter dropdowns and form selects from one source of truth (the repository), so the real backend can own these lists later.

## Cross-cutting contract rules

1. Error strings are complete Vietnamese sentences safe to render directly (toast or inline); no codes, stack traces, or English leak to the client.
2. Every `catch` maps via a `switch`/lookup **with a `default` branch** and logs the underlying error exactly once server-side.
3. Mutations return the fresh entity so the client can update list + panel without a second round-trip (FR-011).
4. The client refreshes the current list query after any successful mutation (router invalidate), keeping table, pagination summary, and panel consistent.
