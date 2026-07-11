# Feature Specification: Email/Password Login

**Feature Branch**: `001-email-password-login`

**Created**: 2026-07-11

**Status**: Draft

**Input**: User description: "Đăng nhập bằng email/mật khẩu cho ERP quản lý sản xuất. Người dùng vào /login, nhập email + mật khẩu, có tùy chọn 'duy trì đăng nhập' (keepSignedIn). Đăng nhập thành công tạo phiên làm việc lưu trong httpOnly cookie (hạn 7 ngày) và chuyển hướng về trang đích (redirectTo) — chỉ chấp nhận đường dẫn nội bộ. Mọi route trong nhóm (authed) phải có phiên hợp lệ. Thông báo lỗi hiển thị tiếng Việt. Hiện trạng: phần lớn đã implement; server function đang là stub chấp nhận mọi credential — việc gọi backend authentication thật là phần còn thiếu."

## Current State

Most of this feature is already built and this spec formalizes it retroactively. The one
known gap: credential verification is a development stub that accepts any email/password
pair (a production-build guard prevents it from shipping). Integrating the real
authentication backend is the remaining work. Convergence between this spec and the
codebase is assessed by `/speckit-converge` after planning.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign in with email and password (Priority: P1)

A factory-office employee opens the ERP, lands on the login screen, enters their work
email and password, and reaches the application. If their credentials are wrong, they see
a Vietnamese error message and can try again.

**Why this priority**: nothing else in the ERP is reachable without a session; this is
the front door.

**Independent Test**: visit `/login`, submit valid credentials, land on the default
authenticated page; submit invalid credentials, see a Vietnamese error and stay on
`/login`.

**Acceptance Scenarios**:

1. **Given** a registered user on `/login`, **When** they submit a valid email and
   password, **Then** a session is created and they are taken to the default
   authenticated page.
2. **Given** a user on `/login`, **When** they submit credentials the authentication
   backend rejects, **Then** no session is created and a Vietnamese error message is
   shown on the form.
3. **Given** a user on `/login`, **When** they submit a malformed email or an empty
   password, **Then** the form blocks submission and shows a Vietnamese validation
   message next to the offending field.
4. **Given** the authentication backend is unreachable, **When** a user submits the
   form, **Then** they see a generic Vietnamese error ("Đã có lỗi xảy ra. Vui lòng thử
   lại.") and no session is created.

---

### User Story 2 - Protected areas require a session (Priority: P1)

Any screen inside the authenticated area is unreachable without a valid session. A
signed-out user who follows a deep link into the app is sent to the login screen, and
after signing in they land on the page they originally asked for.

**Why this priority**: this is an internal ERP holding personnel and production data; an
unguarded screen is a data leak. Ships together with Story 1.

**Acceptance Scenarios**:

1. **Given** no valid session, **When** the user navigates to any authenticated route,
   **Then** they are redirected to `/login` carrying the original destination.
2. **Given** a user arrived at `/login` via such a redirect, **When** they sign in
   successfully, **Then** they are taken to the originally requested page.
3. **Given** the stored destination is an external or otherwise unsafe URL, **When**
   login succeeds, **Then** the destination is ignored and the user is taken to the
   default authenticated page instead.
4. **Given** an expired session, **When** the user navigates to an authenticated route,
   **Then** they are treated as signed out and redirected to `/login`.

---

### User Story 3 - Stay signed in (Priority: P2)

A user who checks "duy trì đăng nhập" on the login form stays signed in across browser
restarts for up to 7 days, so they do not re-authenticate every morning.

**Why this priority**: convenience for daily internal users; login works without it.

**Independent Test**: sign in with the option checked, close and reopen the browser
within 7 days, land in the app without re-authenticating.

**Acceptance Scenarios**:

1. **Given** a user signs in with "duy trì đăng nhập" checked, **When** they return
   within 7 days, **Then** they still have a valid session.
2. **Given** a session older than its 7-day lifetime, **When** the user returns,
   **Then** they must sign in again.

---

### Edge Cases

- Session cookie tampered with or otherwise undecryptable → treated as signed out.
- `redirectTo` points at an external origin, a protocol-relative URL (`//evil.example`),
  or a non-path value → ignored; user goes to the default page.
- `redirectTo` points at `/login` itself → must not create a redirect loop.
- User already holding a valid session visits `/login` → they can still submit; a new
  session replaces the old one.
- Double-submit of the login form → only one session results; the button is disabled
  while a submission is in flight.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST let a user authenticate with an email address and password
  from the `/login` screen.
- **FR-002**: The system MUST validate the login form before submission: a well-formed
  email and a non-empty password, each with a Vietnamese message on violation.
- **FR-003**: The system MUST verify submitted credentials against the authentication
  backend and MUST reject the login when verification fails. *(Gap: current
  implementation is a stub that accepts any credentials; a production-build guard blocks
  shipping it.)*
- **FR-004**: On successful login the system MUST establish a session held only in an
  `httpOnly` cookie, valid for 7 days. Session data MUST never be stored in
  browser-readable storage.
- **FR-005**: Every route in the authenticated area MUST require a valid session; without
  one the user MUST be redirected to `/login` with the original destination preserved.
- **FR-006**: After successful login the system MUST honor a preserved destination only
  when it is an internal application path; anything else falls back to the default
  authenticated page.
- **FR-007**: All user-facing text on the login flow — labels, validation, errors — MUST
  be Vietnamese. Failures MUST show a user-safe message, never raw backend detail.
- **FR-008**: The system MUST NOT log passwords, tokens, or raw authentication backend
  responses.
- **FR-009**: The login form MUST offer a "duy trì đăng nhập" (keep me signed in)
  option. When checked, the session persists for 7 days; when unchecked, the session
  ends when the browser closes. *(Decision R1 in plan research — standard "remember me"
  semantics, safer for shared factory terminals. Gap: the option is currently collected
  but ignored.)*
- **FR-010**: The login form MUST meet the project accessibility floor: labels bound to
  inputs, invalid fields marked as invalid, submit button carrying an explicit type, and
  a disabled state while submission is in flight.

### Key Entities

- **User session**: proof that a user authenticated; carries the user identifier and an
  expiry timestamp. Lives only in an `httpOnly` cookie; absence, expiry, or
  undecryptability all mean "signed out".
- **Login credentials**: email + password + keep-signed-in flag, submitted once and never
  persisted client-side.
- **Redirect destination (`redirectTo`)**: optional internal path captured when an
  unauthenticated user is bounced to `/login`; validated as internal before use.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user with valid credentials gets from opening `/login` to the
  authenticated area in under 30 seconds, in one attempt.
- **SC-002**: 100% of authenticated-area routes redirect a signed-out visitor to
  `/login` — no exceptions.
- **SC-003**: 100% of unsafe `redirectTo` values (external origin, protocol-relative,
  non-path) are ignored in favor of the default page, verified by automated tests.
- **SC-004**: Zero occurrences of passwords, tokens, or raw backend responses in
  application logs during the login flow.
- **SC-005**: A user who signed in with "duy trì đăng nhập" is not asked to
  re-authenticate within 7 days of signing in.

## Assumptions

- Single user type: internal employees. Roles/permissions beyond "authenticated" are out
  of scope for this feature.
- Password reset, account registration, MFA, and logout UI are out of scope here.
- An authentication backend (or its contract) will be available to verify credentials;
  its endpoint contract is decided during planning.
- Session renewal/sliding expiry is out of scope: the session simply expires 7 days
  after login.
- The 7-day lifetime is acceptable for an internal ERP; no compliance rule mandates a
  shorter window.
