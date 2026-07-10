# Feature Specification: User Management UI (Nhân sự)

**Feature Branch**: `001-user-management-ui`

**Created**: 2026-07-10

**Status**: Draft

**Input**: User description: "lên spec làm ui này" — screenshot of the User Management (Nhân sự) screen of the Cơ Khí Tiến Huy ERP: a user list with search, filters, pagination, status badges, row actions, an Export and an Add User button, and a right-hand detail panel with user information and an activity-history tab, all inside the ERP application shell (sidebar navigation, header with breadcrumb, notifications, and user menu).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse the user list (Priority: P1)

An HR/admin user opens **Hệ thống → Nhân sự** from the sidebar and sees a paginated table of all users. Each row shows the row number, user code (e.g. NV001), full name with avatar, department (Phòng ban), position (Chức vụ), email, and a colored status badge — **Hoạt động** (active, green) or **Tạm ngưng** (suspended, orange). Below the table the user sees "Hiển thị 1 đến 10 trong tổng số 35 nhân sự", can move between pages, and can change the page size (e.g. 10 / trang).

**Why this priority**: The list is the core of the screen — every other capability (search, detail, edit, export) operates on it. With only this story delivered, users can already see their workforce, which is a viable MVP.

**Independent Test**: Navigate to the user page with a dataset larger than one page; verify all columns render, the status badges are visually distinct, the count summary is correct, and page navigation / page-size change updates the rows shown.

**Acceptance Scenarios**:

1. **Given** 35 users exist and the page size is 10, **When** the user opens the user page, **Then** the table shows the first 10 users and the summary reads "Hiển thị 1 đến 10 trong tổng số 35 nhân sự".
2. **Given** the user is on page 1, **When** they click page 3, **Then** rows 21–30 are shown and the pagination control marks page 3 as current.
3. **Given** the page size is 10, **When** the user changes it to a larger size, **Then** the table reloads with that many rows per page and pagination adjusts to the new page count.
4. **Given** a user is suspended, **When** their row is displayed, **Then** their status badge reads "Tạm ngưng" and is visually distinct from "Hoạt động".
5. **Given** the user page is open with filters or a page number applied, **When** the user copies the URL and opens it in a new tab, **Then** the same list state (page, filters, search) is restored.

---

### User Story 2 - Search and filter users (Priority: P2)

The user narrows the list using a free-text search box ("Tìm kiếm theo tên, email, SĐT, mã NV...") and three dropdown filters — Phòng ban (department), Chức vụ (position), Trạng thái (status) — each defaulting to "Tất cả" (all). An advanced-filter button (Lọc nâng cao) is available for additional criteria. Search and filters combine, and the pagination summary reflects the filtered total.

**Why this priority**: With dozens or hundreds of users, finding a specific person quickly is the most frequent daily task after simply viewing the list.

**Independent Test**: With a known dataset, type a name fragment and verify only matching rows remain; select a department and verify the intersection of both conditions is shown; clear filters and verify the full list returns.

**Acceptance Scenarios**:

1. **Given** the full list is shown, **When** the user types a fragment of a name, email, phone number, or user code, **Then** only users matching that fragment (case- and diacritic-insensitive) are listed and the total count updates.
2. **Given** a search term is active, **When** the user also selects Phòng ban = "Sản xuất", **Then** the list shows only users matching both the search term and the department.
3. **Given** filters produce no matches, **When** the results are empty, **Then** the table shows a friendly empty state (no matches message) instead of a blank area.
4. **Given** filters are applied, **When** the user resets them to "Tất cả" and clears the search box, **Then** the complete list is shown again.
5. **Given** any filter or search change, **When** results update, **Then** the list returns to page 1.

---

### User Story 3 - View user details in a side panel (Priority: P3)

Selecting a user (via the row or its view action) opens a right-hand detail panel without leaving the list. The panel header shows the avatar, full name, status badge, position, department, email, and phone. A **Thông tin chi tiết** tab shows the general-information section (THÔNG TIN CHUNG): user code, date of birth (Ngày sinh), gender (Giới tính), hire date (Ngày vào làm), national ID number (Số CCCD) and place of issue (Nơi cấp), address (Địa chỉ), plus the department, position, and a notes section (GHI CHÚ). A second tab, **Lịch sử hoạt động**, lists the user's activity history.

**Why this priority**: Detail-at-a-glance beside the list is the screen's signature interaction, but the list and search are usable without it.

**Independent Test**: Click a row and verify the panel populates with that user's data; click another row and verify the panel switches; switch tabs and verify the history view replaces the detail view.

**Acceptance Scenarios**:

1. **Given** the list is shown, **When** the user selects user NV001, **Then** the panel shows NV001's header info and all general-information fields.
2. **Given** the panel is open for one user, **When** the user selects a different row, **Then** the panel updates to the newly selected user.
3. **Given** the panel is open, **When** the user opens the "Lịch sử hoạt động" tab, **Then** a chronological list of that user's record changes/activity is shown (or an empty state if none).
4. **Given** an optional field has no value (e.g. notes), **When** the panel renders, **Then** the field shows a clear empty placeholder (e.g. "-") rather than disappearing or breaking layout.

---

### User Story 4 - Create, edit, and delete users (Priority: P4)

The user adds a new user with the **+ Thêm nhân sự** button, which opens a form for the user's information (name, code, department, position — required — plus email, phone, date of birth, gender, hire date, national ID, address, status, notes). From a row's actions (view / edit / delete / more) or the panel's edit icons, the user updates an existing user. Deleting asks for confirmation before removing the record.

**Why this priority**: Data maintenance is essential but less frequent than viewing/finding; the screen delivers read value first.

**Independent Test**: Create a user and verify it appears in the list with correct data; edit a field and verify the list and panel reflect it; delete it with confirmation and verify it is gone.

**Acceptance Scenarios**:

1. **Given** the user clicks "+ Thêm nhân sự" and submits a valid form, **When** creation succeeds, **Then** the new user appears in the list and a success message is shown in Vietnamese.
2. **Given** the creation form, **When** a required field (e.g. Chức vụ) is left empty or an email is malformed, **Then** the form blocks submission and shows a Vietnamese validation message at the offending field.
3. **Given** an existing user, **When** the user edits and saves changes, **Then** the row and the detail panel both show the updated values.
4. **Given** the user clicks a row's delete action, **When** the confirmation dialog appears and the user confirms, **Then** the user is removed and the total count decreases; **When** the user cancels, **Then** nothing changes.
5. **Given** a save or delete fails, **When** the error occurs, **Then** the user sees a Vietnamese error message and the list keeps its previous data (no silent data loss).

---

### User Story 5 - Export the user list (Priority: P5)

The user clicks **Export** to download the user list as a spreadsheet-compatible file, honoring the currently applied search and filters.

**Why this priority**: Useful for reporting and payroll handoff, but occasional compared to daily browsing and maintenance.

**Independent Test**: Apply a filter, click Export, open the downloaded file, and verify it contains exactly the filtered rows with the visible columns.

**Acceptance Scenarios**:

1. **Given** no filters are applied, **When** the user clicks Export, **Then** a file downloads containing all users with at least the table's columns (code, name, department, position, email, status).
2. **Given** a filter/search is active, **When** the user exports, **Then** the file contains only the filtered users.

---

### Edge Cases

- No users exist at all: the table shows an empty state with a prompt to add the first user; Export is disabled or produces an empty file with headers.
- Search/filter combination yields zero rows: empty state with the option to clear filters.
- The user shown in the detail panel is deleted (from its row actions): the panel closes or shows a placeholder state instead of stale data.
- The user lands on a page number that no longer exists after filtering or deletion (e.g. page 4 of what is now 2 pages): the list falls back to the last valid page instead of showing an empty page.
- A malformed or hand-edited URL (invalid page number, unknown status value) must not crash the screen; invalid parameters are ignored and defaults applied.
- Long values (very long names, addresses, or emails) truncate or wrap gracefully without breaking the table or panel layout.
- The user data fails to load (network/server error): a Vietnamese error message with a retry option is shown instead of a blank screen.
- A user has no avatar image: a fallback (initials or generic avatar) is displayed.
- Duplicate user code entered on create/edit: the form rejects it with a clear message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a paginated user table with columns: row number, user code, full name with avatar, department, position, email, status badge, and a row-actions group (view, edit, delete, more).
- **FR-002**: System MUST show a results summary in the form "Hiển thị X đến Y trong tổng số N nhân sự", page-number navigation with previous/next, and a page-size selector; changing either updates the visible rows.
- **FR-003**: System MUST render user status as a labeled colored badge, with at least the states "Hoạt động" (active) and "Tạm ngưng" (suspended), visually distinguishable and not relying on color alone (text label always present).
- **FR-004**: Users MUST be able to search users by name, email, phone number, or user code from a single search box; matching is case- and diacritic-insensitive and results update the summary and pagination.
- **FR-005**: Users MUST be able to filter by department, position, and status via dropdowns defaulting to "Tất cả"; filters and search combine (logical AND), and any change resets the list to page 1.
- **FR-006**: System MUST provide an advanced-filter entry point ("Lọc nâng cao") offering at least filtering by hire-date range and gender in addition to the basic filters.
- **FR-007**: List state (page, page size, search text, filters, selected user) MUST be shareable and restorable — reopening the same URL reproduces the same view.
- **FR-008**: Selecting a user MUST open a detail panel beside the list showing: avatar, full name, status, position, department, email, phone; and a general-information section with user code, date of birth, gender, hire date, national ID number and place of issue, address, department, position, and notes.
- **FR-009**: The detail panel MUST offer two tabs — "Thông tin chi tiết" (detail) and "Lịch sử hoạt động" (activity history); the history tab lists changes to the user record (what changed, by whom, when) in reverse chronological order, with an empty state when there is none.
- **FR-010**: Users MUST be able to create a user via "+ Thêm nhân sự" with a form covering the fields in FR-008; full name, user code, department, position, and status are required; email and phone formats are validated; user code must be unique.
- **FR-011**: Users MUST be able to edit a user from row actions or the detail panel's edit affordances; saved changes appear in both the list and the panel without a full re-navigation.
- **FR-012**: Users MUST be able to delete a user only after confirming in a dialog that names the user; cancellation leaves data untouched.
- **FR-013**: All create/update/delete outcomes MUST surface a Vietnamese success or error message; failures never silently discard user input.
- **FR-014**: Users MUST be able to export the user list to a spreadsheet-compatible file reflecting the currently applied search and filters and containing at least the table's columns.
- **FR-015**: The screen MUST live inside the ERP application shell: a collapsible sidebar with the module navigation (Nhân sự highlighted under "Hệ thống"), a header with breadcrumb "Dashboard → Nhân sự → Danh sách nhân sự", notification and help icons, and the signed-in user's identity.
- **FR-016**: All user-facing text on the screen MUST be Vietnamese; empty states, loading states, and error states MUST be explicit (never a blank area or raw technical error).
- **FR-017**: The screen MUST be operable by keyboard and assistive technology: icon-only actions have accessible names, form fields have labels, invalid fields are announced as invalid.

### Key Entities

- **User (Nhân sự)**: A person employed by the company. Attributes: user code (unique, e.g. NV001), full name, avatar image (optional), department, position, email, phone, status (active / suspended), date of birth, gender, hire date, national ID number and place of issue, address, notes (optional).
- **Department (Phòng ban)**: Organizational unit a user belongs to (e.g. Kinh doanh, Sản xuất, Kế hoạch, Mua hàng, Kho, Kế toán, Kỹ thuật, Hành chính). Source of the department filter and form options.
- **Position (Chức vụ)**: Job title held by a user (e.g. Trưởng phòng KD, Quản đốc SX, Thủ kho). Source of the position filter and form options.
- **Activity Log Entry (Lịch sử hoạt động)**: A recorded change to a user's record — what changed, who made the change, and when. Belongs to exactly one user.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user unfamiliar with the screen can locate a specific user by name or code in under 15 seconds using search or filters.
- **SC-002**: A user can complete the full create-user flow (open form, fill required fields, save, see the new row) in under 2 minutes.
- **SC-003**: 100% of destructive actions (delete) require an explicit confirmation before taking effect; zero records can be removed by a single click.
- **SC-004**: The list, filters, and detail panel remain correct and usable with at least 1,000 users, with any list interaction (page change, filter, search) reflecting results in under 1 second.
- **SC-005**: Reopening a shared/bookmarked URL reproduces the exact list state (page, filters, search) in 100% of cases.
- **SC-006**: Every empty, loading, and error condition displays an explicit Vietnamese message — no blank panels or untranslated technical errors in any tested scenario.
- **SC-007**: All interactive controls on the screen are reachable and operable by keyboard alone.

## Assumptions

- **Single privileged role for v1**: any user who can open Hệ thống → Nhân sự can view, create, edit, delete, and export users. Fine-grained permissions (e.g. read-only HR viewer) belong to the separate "Phân quyền" module and are out of scope here.
- **Application shell scope**: the sidebar, header, and breadcrumb shown in the screenshot are delivered as part of this feature (nothing exists yet in the app), but only the Nhân sự entry leads to a working screen — all other sidebar modules (Đơn hàng, Lệnh sản xuất, Kho, v.v.) are navigation placeholders and out of scope.
- **Data persistence**: user data is persisted through the company's backend system; this feature consumes it. If the backend endpoint is not ready, the UI is built against a realistic stand-in dataset with the same contract so it can be swapped without UI changes.
- **Add/Edit form shape**: the screenshot does not show the create/edit form; it is assumed to be a modal or side form containing exactly the fields visible in the detail panel (FR-008), with required fields as listed in FR-010.
- **Activity history content**: the "Lịch sử hoạt động" tab is assumed to show record-change history (created, edited, status changed) rather than attendance/timekeeping data.
- **Export format**: a spreadsheet-compatible file (e.g. Excel/CSV class of output) of the current filtered view is sufficient; no template customization or scheduled exports in v1.
- **Status values**: exactly two statuses exist for v1 — active ("Hoạt động") and suspended ("Tạm ngưng"); departments and positions are managed elsewhere and appear here as selectable lists.
- **Desktop-first**: the screen targets desktop use inside the factory office; it must not break on smaller widths, but a tailored mobile layout is out of scope for v1.
- **Notifications, help, and the user menu** in the header are visual shell elements only; their behaviors are separate features.
