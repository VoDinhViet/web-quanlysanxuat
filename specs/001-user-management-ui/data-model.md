# Data Model: User Management UI (Nhân sự)

**Feature**: 001-user-management-ui | **Date**: 2026-07-10

Domain types are language-neutral and presentation-free (no CSS classes, no Vietnamese strings, no image URLs beyond optional avatar). Vietnamese labels are mapped exclusively in the UI layer (`features/users/components/labels.ts`). All types live in `src/features/users/types/user.ts` unless noted; all are `type` declarations with values derived from Zod schemas via `z.infer` where a schema exists.

## Enums (string unions)

| Type | Values | UI labels (labels.ts) |
|------|--------|-----------------------|
| `UserStatus` | `"active"` \| `"suspended"` | Hoạt động / Tạm ngưng |
| `Gender` | `"male"` \| `"female"` | Nam / Nữ |
| `ActivityAction` | `"created"` \| `"updated"` \| `"status_changed"` \| `"deleted"` | Tạo mới / Cập nhật / Đổi trạng thái / Xóa |

Label maps are exhaustive `Record<Enum, string>` so a new enum member fails compilation until labeled.

## Entities

### User

The central record. One row in the table; the full shape feeds the detail panel and form.

| Field | Type | Required | Validation (Zod, single source) |
|-------|------|----------|--------------------------------|
| `id` | `string` | yes | opaque unique id (repository-generated) |
| `code` | `string` | yes | pattern `NV` + digits (e.g. `NV001`); **unique** across store (checked on create/edit) |
| `fullName` | `string` | yes | trimmed, 1–100 chars |
| `department` | `string` | yes | must be one of the department list |
| `position` | `string` | yes | must be one of the position list |
| `email` | `string` | yes | valid email format |
| `phone` | `string` | yes | Vietnamese phone: 10 digits, leading 0 (spaces tolerated on input, stored normalized) |
| `status` | `UserStatus` | yes | defaults to `"active"` on create |
| `dateOfBirth` | `string` (ISO date) | yes | valid date, in the past |
| `hireDate` | `string` (ISO date) | yes | valid date, ≥ dateOfBirth |
| `gender` | `Gender` | yes | — |
| `nationalId` | `string` | yes | 12 digits (CCCD) |
| `nationalIdIssuePlace` | `string` | yes | 1–200 chars |
| `address` | `string` | yes | 1–300 chars |
| `notes` | `string` | no | ≤ 1000 chars; empty renders as "-" in the panel |

Dates are ISO `yyyy-MM-dd` strings in the domain; formatted to `dd/MM/yyyy` only at render time (date-fns).

**Derived (never stored)**: avatar initials (from `fullName`), Vietnamese status/gender labels.

**State transitions**: `active ⇄ suspended` (edit/status change, logged); any state → deleted (hard delete in fake store, logged before removal).

### Department (Phòng ban)

Fixed reference list in the fake phase (managed elsewhere per spec assumption): Kinh doanh, Sản xuất, Kế hoạch, Mua hàng, Kho, Kế toán, Kỹ thuật, Hành chính. Exposed by the repository as `string[]` for filter options and form selects. Modeled as plain `string` on User (not an enum) because the real backend will own this list.

### Position (Chức vụ)

Same treatment as Department. Seed list: Trưởng phòng KD, Nhân viên KD, Quản đốc SX, Nhân viên vận hành, Nhân viên kế hoạch, Nhân viên mua hàng, Thủ kho, Kế toán viên, Kỹ sư thiết kế, Nhân viên HCNS.

### ActivityLogEntry (Lịch sử hoạt động)

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | unique |
| `userId` | `string` | belongs to exactly one User |
| `action` | `ActivityAction` | what kind of change |
| `description` | `string` | Vietnamese, human-readable ("Cập nhật chức vụ: Nhân viên KD → Trưởng phòng KD") |
| `actor` | `string` | who made the change (fake phase: "Admin ERP") |
| `occurredAt` | `string` (ISO datetime) | sort key, rendered newest-first |

Written by the fake repository on every mutation; also pre-seeded 1–3 entries per user.

## Query / result shapes

### UserListQuery (from URL search params, `user-search-schema.ts`)

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `page` | number ≥ 1 | 1 | `.catch(1)`; clamped server-side to last valid page (edge case) |
| `pageSize` | 10 \| 20 \| 50 | 10 | `.catch(10)` |
| `q` | string | — | free text: name/email/phone/code, diacritic-insensitive |
| `department` | string | — | absent = "Tất cả" |
| `position` | string | — | absent = "Tất cả" |
| `status` | `UserStatus` | — | absent = "Tất cả"; invalid value `.catch(undefined)` |
| `gender` | `Gender` | — | advanced filter |
| `hiredFrom` / `hiredTo` | ISO date | — | advanced filter range |
| `selected` | string | — | user id shown in detail panel |
| `tab` | `"detail"` \| `"history"` | `"detail"` | detail panel tab |

All conditions combine with AND. Any change to `q`/filters resets `page` to 1 (done in the navigate call, not the schema).

### PaginatedUsers

`{ items: User[], total: number, page: number, pageSize: number }` — `page` echoed back post-clamping so the client can sync the URL when it requested a now-invalid page.

### ActionResult<T> (shared, `src/lib/action-result.ts`)

```
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }   // Vietnamese, user-displayable
```

Every server function returns this; components branch on `ok` (compiler-enforced).

## Relationships

```
User 1 ── * ActivityLogEntry     (log entries die with their user)
User * ── 1 Department (by name, reference list)
User * ── 1 Position   (by name, reference list)
```
