# Quickstart: User Management UI (Nhân sự)

**Feature**: 001-user-management-ui — validation guide (what to run and what must be true).

## Prerequisites

```bash
pnpm install          # after zod + @tanstack/react-form are approved & added
pnpm dev              # http://localhost:3000
```

Fake-data phase: no backend, no env vars. Data is seeded in-memory ([research.md R1](./research.md)) and **resets when the dev server restarts** — expected behavior, not a bug.

## End-to-end validation scenarios

Run in the browser against `pnpm dev`. These mirror the spec's acceptance scenarios; the feature is done only when all pass by actual execution (Constitution Principle V).

### 1. Browse (US1 — P1)

- Open `/` → redirected to `/users`; shell shows sidebar (Nhân sự active under HỆ THỐNG), breadcrumb "Dashboard → Nhân sự → Danh sách nhân sự".
- Table shows 10 rows, summary "Hiển thị 1 đến 10 trong tổng số 40 nhân sự" (seed count).
- Page 3 → rows 21–30; change page size to 20 → pagination recomputes.
- A suspended user shows "Tạm ngưng" badge, visually distinct from "Hoạt động".
- Copy URL with `?page=3&pageSize=20`, open in new tab → identical view (SC-005).

### 2. Search & filter (US2 — P2)

- Type `tran quoc huy` (no diacritics) → row "Trần Quốc Huy" found; count updates; page resets to 1.
- Search + Phòng ban = "Sản xuất" → intersection only.
- Filter with zero matches → Vietnamese empty state + clear-filters affordance, no blank area.
- Reset all to "Tất cả", clear search → full list returns.
- Lọc nâng cao: gender + hire-date range narrow the list.
- Hand-edit URL to `?page=999&status=bogus` → no crash; last valid page, status ignored.

### 3. Detail panel (US3 — P3)

- Click row NV001 → panel shows header (avatar initials, name, badge, position, department, email, phone) and THÔNG TIN CHUNG fields; URL gains `selected=`.
- Click another row → panel switches.
- "Lịch sử hoạt động" tab → seeded entries newest-first; URL gains `tab=history`.
- User with empty notes → GHI CHÚ shows "-".

### 4. Create / edit / delete (US4 — P4)

- "+ Thêm nhân sự" → form; submit empty → Vietnamese field errors (only after touch), submission blocked.
- Duplicate code `NV001` → "Mã nhân viên đã tồn tại."
- Valid create → success toast, row appears, total becomes 41.
- Edit position via row action → table row AND open panel both update; new entry appears in Lịch sử hoạt động.
- Delete → confirmation dialog names the user; Cancel → nothing changes; Confirm → row gone, total decrements; if it was selected, panel shows placeholder, not stale data.

### 5. Export (US5 — P5)

- No filters → Export downloads `nhan-su-<date>.csv`; opens in Excel with Vietnamese intact (UTF-8 BOM), all rows, columns per [contract](./contracts/user-server-functions.md).
- With filter active → file contains only filtered rows.

### 6. Accessibility & polish sweep

- Tab through the page: search, filters, rows, row actions, pagination, panel tabs all reachable; icon-only buttons announce Vietnamese labels.
- No raw color classes (dark mode unbroken); long name/address truncates gracefully.

## Automated checks (definition of done, Constitution gates)

```bash
pnpm typecheck   # gate 1 — clean
pnpm lint        # gate 2 — clean, repo-wide
pnpm format      # gate 3 — run before finishing
pnpm test        # unit tests: repository filtering/pagination, diacritic search, CSV builder, schemas
```

Then re-read the full diff (no console.log, no stray files) and confirm the scenarios above in the running app.

## Performance spot-check (SC-004)

Temporarily raise the seed-size constant in `fake-data.ts` to 1000, restart dev, and verify page/filter/search interactions respond in < 1s. Restore the constant afterwards.
