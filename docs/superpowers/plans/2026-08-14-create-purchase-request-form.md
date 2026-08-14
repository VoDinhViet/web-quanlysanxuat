# Create Purchase Request Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Note on verification:** this repo has no test suite (`CLAUDE.md`: "There
> are currently no test files in the repo"). Per `CLAUDE.md`'s actual
> Definition of Done, every "Verify" step below means `pnpm typecheck` /
> `pnpm exec eslint` / manual `pnpm dev` walkthrough — not TDD unit tests.

**Goal:** Build the "Tạo đề xuất mua hàng thủ công" (Create Purchase Request)
form — FE only — so a user can manually create a `purchase-requests` entity
(department + needed date + material lines), landing on its detail page to
send it for approval.

**Architecture:** Mirrors `src/features/inventory-receipts/components/create/`
almost exactly (closest domain precedent — same "pick materials, no pricing
on the request itself" shape), composed with `useAppForm`/`withForm` +
`createServerFn` + `useMutation`, following `CreateOrderForm.tsx`'s 2-column
layout (main content + sticky sidebar summary card).

**Tech Stack:** TanStack Form (`useAppForm`/`withForm`), TanStack Query
(`useQuery`/`useMutation`), Zod v4, `lucide-react` icons, `luxon` for date
formatting.

**Spec:** No separate spec doc — this repo's own precedent
(`docs/superpowers/plans/2026-07-18-create-supplier-form.md`) shows the
brainstorming → plan flow used here skips a `docs/superpowers/specs/` file;
the design was fully worked out and approved with the user in-chat during
brainstorming, and is embedded below as "Scope decisions confirmed with
user" + "Domain model" + "Reference patterns" so this plan is self-contained.

## Global Constraints

- Domain values stay language-neutral in code; Vietnamese labels live in
  `Record<Enum, string>` maps at the display edge (`purchaseRequestStatusLabels`,
  already defined in `src/lib/types/purchase-request.type.ts` — reuse it, do
  not add a second map).
- Server functions: `GENERIC_ERROR_MESSAGE` + `resolve<Name>ErrorMessage`
  (switch on `errorCode`, always a `default` branch) + try/catch +
  `logHttpError`. Never surface a raw backend/HTTP string to the UI.
- No `any`, `@ts-ignore`, `@ts-expect-error`, non-null `!`. Top-level
  `import type` for type-only imports (ESLint catches this, `tsc` does not —
  always run `pnpm exec eslint` per file, not just `pnpm typecheck`).
- `pnpm typecheck` and `pnpm exec eslint <file>` clean after every task
  below; `pnpm format` before the final review.
- Every feature reads another feature's data only through that feature's
  `api/index.ts` barrel (`@/features/departments/api`, `@/features/products/api`)
  — never its `api/server-functions/` or `api/options/` directly.
- A feature never imports another feature's `hooks/` — `use-get-material-options.ts`
  must be a fresh, feature-local copy in `purchase-requests`, not an import
  from `inventory-receipts`.

---

## Scope decisions (confirmed with user during brainstorming)

- **Backend readiness:** `purchase-requests` currently only has GET (list/detail)
  + update/approve/reject/send — comments in `PurchaseRequestsPage.tsx` and
  `PurchaseRequestTableCells.tsx` say "giai đoạn 1 chỉ có GET /purchase-requests".
  User explicitly asked to build FE assuming `POST /purchase-requests` exists
  (or will exist) following the same pattern as the repo's other purchasing
  create flows — this plan does exactly that. `resolveCreatePurchaseRequestErrorMessage`
  (Task 5) therefore has only a `default` branch for now; add real `errorCode`
  branches once the backend contract is confirmed.
- **Material scope:** item lines pick **only Nguyên vật liệu (RM)** — no
  finished goods — matching `PurchaseRequestItemRef`'s own doc comment
  ("purchase_request_items always points at an RM in practice") and the
  identical restriction `inventory-receipts` already applies.
- **Post-create navigation:** on success, navigate to the **detail page**
  of the newly created PR (`/manage/purchase-requests/$purchaseRequestId`),
  not back to the list — so the user can immediately review and click the
  existing "Gửi duyệt" action (`SendPurchaseRequestDialog`, already built on
  `PurchaseRequestDetailPage`). This means `createPurchaseRequest` must
  **return `{id: string}`**, unlike `createOrder`/`createInventoryReceipt`
  which return `void`.
- **No stock preview:** the item-add dialog does **not** show `onHand`/tồn
  kho — keep it as simple as `InventoryReceiptItemDialog` (material + quantity
  + note only). `onHand`/`bomDemand`/`available`/`fromStock` are all computed
  server-side at read time per `PurchaseRequestItem`'s doc comment — never
  create-time inputs.
- **One submit path:** a single "Tạo đề xuất" button that always creates a
  `DRAFT` request. No combined "Tạo & Gửi duyệt" button — sending is a
  separate, already-built action on the detail page.
- **Existing placeholder button:** `PurchaseRequestsTableFilter.tsx` already
  has a disabled `PendingAction` button reading **"Tạo đề xuất mua hàng
  (Manual)"** with `variant="default"` (primary), with a comment citing "the
  reference mockup (UI_PR_01)" — that mockup is not present anywhere in this
  repo (confirmed via search; `.design-sync`/`.ds-sync` are unrelated Figma
  tool caches from before this feature existed). Task 12 swaps this
  `PendingAction` for a real `Link`, **keeping the exact existing label and
  `variant="default"`** — do not rename it to something like "Tạo đề xuất"
  even though the create form's own submit button (Task 10) is shorter
  ("Tạo đề xuất") — the two labels intentionally differ (filter-bar CTA vs.
  in-form submit button), both correct in context.

## Domain model (read from `src/lib/types/purchase-request.type.ts` — do not re-derive, use as-is)

- `PurchaseRequestStatus`: `DRAFT` → `PENDING_APPROVAL` (send) →
  `APPROVED`/`REJECTED`.
- `PurchaseRequestDetail` fields relevant to create: `department` (`Department
  = {id, code, name}`, from `src/lib/types/department.type.ts`), `neededDate`
  (string). `code` is backend-generated. `requesterBy` is set server-side from
  the session — never a form field. `productionOrder`/`productionJob` are
  nullable and only populated for PRs auto-generated from a production
  shortage — never applicable to a manual create. There is **no header-level
  "lý do"/note field** — `PurchaseRequestTableCells.tsx`'s comment confirms
  the backend has no `reason` column yet.
- `PurchaseRequestItem`: `item` (`PurchaseRequestItemRef = {id, code, name,
  unit}`), `quantity`, `note`. `onHand`/`bomDemand`/`available`/`fromStock`
  are all computed live server-side — never create-time inputs.
- **Conclusion:** the create form needs exactly 2 header fields
  (`departmentId` required, `neededDate` required) + `items[]` (each:
  `itemId` required, `quantity` required positive number, `note` optional).

## Reference patterns (read in full — mirror these exactly, do not invent new shapes)

1. `src/features/inventory-receipts/schemas/create-inventory-receipt.schema.ts`
   — object schema shape, `.min(1, "...")` on `items` (a receipt/request with
   zero lines is meaningless, unlike `orders` which allows empty).
2. `src/features/inventory-receipts/hooks/use-get-material-options.ts` — a
   feature-local hook wrapping `itemOptionsQueryOptions({q, type: "RM"})`
   from `@/features/products/api`. `ItemRef` (the type this endpoint returns)
   is `{id, code, name}` — **no `unit` field**, which is why
   `InventoryReceiptGenericItemsSection` has **no ĐVT column** and its dialog
   never sets an `itemUnit` value. This plan follows the exact same shape —
   no `itemUnit` field anywhere in the new schema/table.
3. `src/features/inventory-receipts/components/create/InventoryReceiptItemDialog.tsx`
   + `InventoryReceiptGenericItemsSection.tsx` — dialog (material combobox +
   quantity + note) and items table (#, Vật tư, Số lượng, Ghi chú, Thao tác;
   no reorder buttons — this repo only adds move-up/move-down to `orders`'
   commercial line items, not material-picker lists).
4. `src/features/inventory-receipts/components/create/InventoryReceiptHeaderSection.tsx`
   — `drafting-title-block` header shell (defined in `src/styles.css:219`,
   also used by `orders`) with a "Mã ...: sẽ cấp sau khi lưu" subtitle.
5. `src/features/inventory-receipts/components/create/InventoryReceiptCreateForm.tsx`
   — full form composition: `useAppForm` + `useFormDraft`/`restoreFormDraft`
   (`src/hooks/use-form-draft.ts`) + `useMutation` + `useNavigate`; footer
   buttons Hủy / Đặt lại / Lưu nháp / submit.
6. `src/routes/(authed)/manage_/inventory-receipts_/create.tsx` — a create
   route has **no loader**: every reference list (department here) is a plain
   `useQuery` inside the component, not prefetched.
7. `src/features/orders/components/create/CreateOrderForm.tsx` — 2-column
   grid layout (`lg:grid-cols-[minmax(0,1fr)_22rem]`, sticky sidebar).
8. `src/features/materials/components/MaterialsTableFilter.tsx` (~line
   148-166) + `src/features/materials/pages/MaterialsPage.tsx` (~line 59-75)
   — `<PermissionGate permission="..."><Button asChild><Link to="...">`
   pattern for a list page's create CTA, both in the filter bar and in
   `TableEmptyState`'s `action` prop.
9. `src/features/purchase-requests/components/PurchaseRequestTableCells.tsx:49-51`
   — confirms the exact route string: `to="/manage/purchase-requests/$purchaseRequestId"`,
   `params={{purchaseRequestId}}`.
10. `src/lib/types/permission.type.ts` — flat `PERMISSION_CODES` array,
    grouped by resource (`"purchase-requests:read"`, `"purchase-requests:update"`,
    `"purchase-requests:approve"` already present).

## UI design approved with user ("trực quan, đầy đủ, tránh trống trải, tiện dụng")

- **Layout:** 2-column grid like `CreateOrderForm` — main column (header +
  items table) + sticky sidebar "Tóm tắt đề xuất" card.
- **Header section:** `drafting-title-block` title "Đề xuất mua hàng" +
  subtitle "Mã đề xuất: sẽ cấp sau khi lưu", then a `sm:grid-cols-2` field
  grid (not 4 columns — only 2 real fields, a wider grid would look empty):
  Phòng ban (`SelectField`, options from `departmentOptionsQueryOptions()`),
  Ngày cần hàng (`DateField`, required). A helper line below the grid:
  "Đề xuất sẽ được lưu ở trạng thái Nháp. Vào trang chi tiết để gửi duyệt
  sau khi tạo."
- **Items section:** table (#, Vật tư, Số lượng, Ghi chú, Thao tác), "Thêm
  vật tư" button, empty-row message "Đề xuất cần ít nhất một dòng vật tư.
  Bấm "Thêm vật tư" để thêm."
- **Item dialog:** 3 fields only (Vật tư combobox RM-only, Số lượng, Ghi
  chú), stacked vertically (not a 2-col grid — with no second field to pair
  next to Số lượng, a grid would leave a dangling empty cell).
- **Sidebar "Tóm tắt đề xuất" card:** live item count + total quantity (read
  via `form.Subscribe`, selector returns an object per `forms-and-ui.md`'s
  multi-field-read rule), selected phòng ban name (fallback "Chưa chọn"),
  ngày cần hàng formatted `dd/MM/yyyy` (fallback "—"), plus a small 3-step
  visual (Nháp → Chờ duyệt → Đã duyệt, using `purchaseRequestStatusLabels`,
  step 1 highlighted "Sẽ tạo ở đây") — fills the sidebar with genuinely
  useful content instead of a sparse box.
- **Footer:** Hủy / Đặt lại / Lưu nháp (local draft) / Tạo đề xuất.

---

### Task 1: Add `purchase-requests:create` permission code

**Files:**
- Modify: `src/lib/types/permission.type.ts:51-53`

**Interfaces:** No new exports — adds one string literal to the existing
`PERMISSION_CODES` array/`PermissionCode` union.

- [ ] **Step 1: Edit** — insert the new code between `purchase-requests:read`
  and `purchase-requests:update`:

```ts
  "purchase-requests:read",
  "purchase-requests:create",
  "purchase-requests:update",
  "purchase-requests:approve",
```

- [ ] **Step 2: Verify** — `pnpm typecheck` clean (pure addition, no
  consumers yet).

---

### Task 2: `purchase-request-item-form.schema.ts`

**Files:**
- Create: `src/features/purchase-requests/schemas/purchase-request-item-form.schema.ts`

**Interfaces:**
- Produces: `purchaseRequestItemFormFields`, `purchaseRequestItemFormSchema`,
  `PurchaseRequestItemFormValue` (type), `purchaseRequestItemDefaultValue`.

- [ ] **Step 1: Write the file**

```ts
import { z } from "zod"

import { emptyToUndefined, isPositiveNumberString } from "@/lib/zod-transforms"

// One dòng vật tư của đề xuất mua hàng. Không có itemUnit/unitPrice/status như
// order-item-form.schema.ts hay inventory-receipt-item-form.schema.ts — PR không có khái
// niệm giá, và itemOptionsQueryOptions (qua useGetMaterialOptions) chỉ trả {id,code,name},
// không có unit (cùng lý do InventoryReceiptGenericItemsSection không có cột ĐVT).
export const purchaseRequestItemFormFields = {
  itemId: z.string().trim().min(1, "Vui lòng chọn vật tư"),
  // UI-only — re-displayed in the items table without a second item fetch;
  // dropped by purchaseRequestItemFormSchema's own transform below before the
  // payload reaches the create server function.
  itemLabel: z.string(),
  quantity: z
    .string()
    .trim()
    .refine(isPositiveNumberString, "Số lượng phải lớn hơn 0")
    .transform(Number),
  note: z
    .string()
    .trim()
    .max(500, "Ghi chú tối đa 500 ký tự")
    .transform(emptyToUndefined),
}

export const purchaseRequestItemFormSchema = z
  .object(purchaseRequestItemFormFields)
  .transform(({ itemLabel, ...item }) => item)

export type PurchaseRequestItemFormValue = z.input<
  typeof purchaseRequestItemFormSchema
>

export const purchaseRequestItemDefaultValue: PurchaseRequestItemFormValue = {
  itemId: "",
  itemLabel: "",
  quantity: "1",
  note: "",
}
```

- [ ] **Step 2: Verify** — `pnpm typecheck` clean.

---

### Task 3: `create-purchase-request.schema.ts`

**Files:**
- Create: `src/features/purchase-requests/schemas/create-purchase-request.schema.ts`

**Interfaces:**
- Consumes: `purchaseRequestItemFormSchema` (Task 2).
- Produces: `createPurchaseRequestSchema`, `CreatePurchaseRequestSchema`
  (type), `createPurchaseRequestFormDefaultValues`.

- [ ] **Step 1: Write the file**

```ts
import { z } from "zod"

import { purchaseRequestItemFormSchema } from "@/features/purchase-requests/schemas/purchase-request-item-form.schema"
import { toIsoDate } from "@/lib/zod-transforms"

// Wire contract for POST /api/purchase-requests — also the client-side onSubmit validator
// for PurchaseRequestCreateForm. No `note`/`reason` header field — the backend has no such
// column yet (see PurchaseRequestTableCells.tsx's comment). `items` requires at least one
// line, same idiom as create-inventory-receipt.schema.ts (a request with zero lines is
// meaningless, unlike orders which allows empty).
export const createPurchaseRequestSchema = z.object({
  departmentId: z.string().trim().min(1, "Vui lòng chọn phòng ban"),
  neededDate: z
    .string()
    .min(1, "Vui lòng chọn ngày cần hàng")
    .transform(toIsoDate),
  items: z
    .array(purchaseRequestItemFormSchema)
    .min(1, "Đề xuất cần ít nhất một dòng vật tư"),
})

export type CreatePurchaseRequestSchema = z.input<
  typeof createPurchaseRequestSchema
>

export const createPurchaseRequestFormDefaultValues: CreatePurchaseRequestSchema =
  {
    departmentId: "",
    neededDate: "",
    items: [],
  }
```

- [ ] **Step 2: Verify** — `pnpm typecheck` clean.

---

### Task 4: `hooks/use-get-material-options.ts`

**Files:**
- Create: `src/features/purchase-requests/hooks/use-get-material-options.ts`

**Interfaces:**
- Consumes: `itemOptionsQueryOptions` from `@/features/products/api` (barrel
  — never `products/api/server-functions` or `products/api/options` directly).
- Produces: `useGetMaterialOptions(): {items: ItemRef[], options:
  {value, label}[], isFetching: boolean, onSearchChange: (q: string) => void}`.

- [ ] **Step 1: Write the file** (feature-local copy — do not import
  `inventory-receipts`' hook, see Global Constraints)

```ts
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDebounceValue } from "usehooks-ts"

import { itemOptionsQueryOptions } from "@/features/products/api"

// Combobox data hook cho dòng vật tư của đề xuất mua hàng — luôn lọc type: "RM" (đề xuất chỉ
// mua nguyên vật liệu). Cùng khuôn inventory-receipts/hooks/use-get-material-options.ts,
// nhân bản riêng cho feature này (không import chéo hook giữa 2 feature — xem
// .claude/rules/architecture.md). itemOptionsQueryOptions chỉ trả ItemRef ({id,code,name},
// không có unit) nên dòng đề xuất không tự hiện đơn vị tính khi chọn.
export function useGetMaterialOptions() {
  const [q, setQ] = useDebounceValue("", 300)
  const { data: items = [], isFetching } = useQuery({
    ...itemOptionsQueryOptions({ q, type: "RM" }),
    placeholderData: keepPreviousData,
  })

  const options = items.map((item) => ({
    value: item.id,
    label: `${item.code} — ${item.name}`,
  }))

  return { items, options, isFetching, onSearchChange: setQ }
}
```

- [ ] **Step 2: Verify** — `pnpm typecheck` clean.

---

### Task 5: `api/server-functions/create-purchase-request.api.ts`

**Files:**
- Create: `src/features/purchase-requests/api/server-functions/create-purchase-request.api.ts`

**Interfaces:**
- Consumes: `createPurchaseRequestSchema` (Task 3), `http`/`logHttpError`/
  `ApiErrorResponse` (`src/lib/http.ts`).
- Produces: `createPurchaseRequest(data) => Promise<{id: string}>`.

- [ ] **Step 1: Write the file**

```ts
import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createPurchaseRequestSchema } from "@/features/purchase-requests/schemas/create-purchase-request.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

// POST /api/purchase-requests chưa tồn tại trên backend tại thời điểm viết (xem comment
// "giai đoạn 1 chỉ có GET /purchase-requests" trong PurchaseRequestsPage.tsx) — endpoint và
// payload giả định theo đúng pattern các luồng purchasing khác (vd createInventoryReceipt).
// errorCode thật sẽ bổ sung vào switch dưới đây khi backend triển khai xong; tạm thời chỉ
// có nhánh default.
function resolveCreatePurchaseRequestErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

type CreatePurchaseRequestResult = {
  id: string
}

// Luôn tạo ở DRAFT. Khác createOrder/createInventoryReceipt (trả void): trả về {id} vì
// PurchaseRequestCreateForm điều hướng thẳng sang trang chi tiết vừa tạo (để gửi duyệt
// ngay), không quay về danh sách.
export const createPurchaseRequest = createServerFn({ method: "POST" })
  .validator(createPurchaseRequestSchema)
  .handler(async ({ data }): Promise<CreatePurchaseRequestResult> => {
    try {
      const response = await http.post<CreatePurchaseRequestResult>(
        "/api/purchase-requests",
        data
      )

      return response.data
    } catch (error) {
      logHttpError(error, "createPurchaseRequest")

      throw new Error(resolveCreatePurchaseRequestErrorMessage(error))
    }
  })
```

- [ ] **Step 2: Verify** — `pnpm typecheck` clean.

---

### Task 6: `components/create/PurchaseRequestCreateHeaderSection.tsx`

**Files:**
- Create: `src/features/purchase-requests/components/create/PurchaseRequestCreateHeaderSection.tsx`

**Interfaces:**
- Consumes: `createPurchaseRequestFormDefaultValues` (Task 3),
  `departmentOptionsQueryOptions` from `@/features/departments/api`,
  `buildSelectOptions` (`src/lib/utils.ts`), `withForm` (`src/hooks/use-app-form.ts`).
- Produces: `PurchaseRequestCreateHeaderSection` — `withForm(...)` component,
  `{form, disabled}` render signature.

- [ ] **Step 1: Write the file**

```tsx
import { useQuery } from "@tanstack/react-query"

import { withForm } from "@/hooks/use-app-form"
import { departmentOptionsQueryOptions } from "@/features/departments/api"
import { createPurchaseRequestFormDefaultValues } from "@/features/purchase-requests/schemas/create-purchase-request.schema"
import { buildSelectOptions } from "@/lib/utils"

export const PurchaseRequestCreateHeaderSection = withForm({
  defaultValues: createPurchaseRequestFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    // Không loader ở route create — danh sách phòng ban là 1 useQuery nhỏ ngay trong
    // component, cùng lý do InventoryReceiptHeaderSection.tsx không prefetch kho/NCC.
    const { data: departments = [] } = useQuery(
      departmentOptionsQueryOptions()
    )

    return (
      <div className="drafting-title-block">
        <div className="border-b border-border px-4 py-4 sm:px-5">
          <h2 className="font-heading text-base font-semibold tracking-wide text-foreground uppercase">
            Đề xuất mua hàng
          </h2>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            Mã đề xuất: sẽ cấp sau khi lưu
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 px-4 py-5 sm:grid-cols-2 sm:px-5">
          <form.AppField name="departmentId">
            {(field) => (
              <field.SelectField
                label="Phòng ban"
                required
                placeholder="Chọn phòng ban"
                options={buildSelectOptions(departments)}
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="neededDate">
            {(field) => (
              <field.DateField
                label="Ngày cần hàng"
                required
                disabled={disabled}
              />
            )}
          </form.AppField>

          <p className="text-xs text-muted-foreground sm:col-span-2">
            Đề xuất sẽ được lưu ở trạng thái Nháp. Vào trang chi tiết để gửi
            duyệt sau khi tạo.
          </p>
        </div>
      </div>
    )
  },
})
```

- [ ] **Step 2: Verify** — `pnpm typecheck` clean.

---

### Task 7: `components/create/PurchaseRequestItemDialog.tsx`

**Files:**
- Create: `src/features/purchase-requests/components/create/PurchaseRequestItemDialog.tsx`

**Interfaces:**
- Consumes: `useGetMaterialOptions` (Task 4), `purchaseRequestItemDefaultValue`/
  `purchaseRequestItemFormSchema`/`PurchaseRequestItemFormValue` (Task 2),
  `ComboboxField` (`src/components/shared/ComboboxField.tsx`).
- Produces: `PurchaseRequestItemDialog({open, onOpenChange, initialValue,
  onSubmit})`.

- [ ] **Step 1: Write the file**

```tsx
import { useState } from "react"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ComboboxField } from "@/components/shared/ComboboxField"
import { useAppForm } from "@/hooks/use-app-form"
import { useGetMaterialOptions } from "@/features/purchase-requests/hooks/use-get-material-options"
import {
  purchaseRequestItemDefaultValue,
  purchaseRequestItemFormSchema,
} from "@/features/purchase-requests/schemas/purchase-request-item-form.schema"
import type { PurchaseRequestItemFormValue } from "@/features/purchase-requests/schemas/purchase-request-item-form.schema"

type PurchaseRequestItemDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // `null` = add mode; a row value = edit mode.
  initialValue: PurchaseRequestItemFormValue | null
  onSubmit: (value: PurchaseRequestItemFormValue) => void
}

export function PurchaseRequestItemDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
}: PurchaseRequestItemDialogProps) {
  // Combobox vật tư phải portal popup vào bên trong DOM subtree của dialog này — cùng lý do
  // ComboboxField.tsx đã ghi (Radix FocusScope nuốt click bên ngoài dialog).
  const [contentNode, setContentNode] = useState<HTMLDivElement | null>(null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={setContentNode}
        className="shadow-lg ring-0 sm:max-w-lg"
      >
        {/* Radix unmounts content while closed, so this form re-mounts on each
            open and its state seeds fresh from `initialValue`. */}
        <PurchaseRequestItemDialogForm
          container={contentNode}
          initialValue={initialValue}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

type PurchaseRequestItemDialogFormProps = {
  container: HTMLDivElement | null
  initialValue: PurchaseRequestItemFormValue | null
  onSubmit: (value: PurchaseRequestItemFormValue) => void
  onCancel: () => void
}

function PurchaseRequestItemDialogForm({
  container,
  initialValue,
  onSubmit,
  onCancel,
}: PurchaseRequestItemDialogFormProps) {
  const isEditing = initialValue !== null
  const material = useGetMaterialOptions()

  const form = useAppForm({
    defaultValues: initialValue ?? purchaseRequestItemDefaultValue,
    validators: {
      onSubmit: purchaseRequestItemFormSchema,
    },
    onSubmit: ({ value }) => onSubmit(value),
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
      noValidate
      className="flex flex-col gap-5"
    >
      <DialogHeader className="gap-1">
        <DialogTitle className="text-base font-semibold">
          {isEditing ? "Sửa dòng vật tư" : "Thêm dòng vật tư"}
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Thông tin dòng vật tư trong đề xuất mua hàng
        </DialogDescription>
      </DialogHeader>

      {/* Xếp dọc, không dùng grid 2 cột: chỉ 3 field và không có field nào ghép cặp tự
          nhiên với Số lượng, một lưới 2 cột sẽ để lại 1 ô trống — trái với nguyên tắc
          tránh trống trải của toàn bộ màn hình tạo đề xuất. */}
      <div className="flex flex-col gap-4">
        <form.Field name="itemId">
          {(field) => (
            <ComboboxField
              id="purchase-request-item-material"
              label="Vật tư"
              required
              placeholder="Tìm mã hoặc tên vật tư..."
              value={field.state.value || undefined}
              onValueChange={(next) => {
                field.handleChange(next ?? "")
                const selected = material.items.find(
                  (item) => item.id === next
                )
                form.setFieldValue(
                  "itemLabel",
                  selected ? `${selected.code} — ${selected.name}` : ""
                )
              }}
              onBlur={field.handleBlur}
              isInvalid={
                field.state.meta.isTouched &&
                field.state.meta.errors.length > 0
              }
              errors={field.state.meta.errors}
              options={material.options}
              onSearchChange={material.onSearchChange}
              isPending={material.isFetching}
              initialOption={
                initialValue
                  ? {
                      value: initialValue.itemId,
                      label: initialValue.itemLabel,
                    }
                  : undefined
              }
              emptyMessage="Không tìm thấy vật tư"
              container={container}
            />
          )}
        </form.Field>

        <form.AppField name="quantity">
          {(field) => (
            <field.NumberField
              id="purchase-request-item-quantity"
              label="Số lượng"
              required
              placeholder="0"
            />
          )}
        </form.AppField>

        <form.AppField name="note">
          {(field) => (
            <field.TextareaField
              id="purchase-request-item-note"
              label="Ghi chú"
              placeholder="Nhập ghi chú (nếu có)"
            />
          )}
        </form.AppField>
      </div>

      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit">
          <Check className="size-4" />
          Lưu
        </Button>
      </DialogFooter>
    </form>
  )
}
```

- [ ] **Step 2: Verify** — `pnpm typecheck` clean.

---

### Task 8: `components/create/PurchaseRequestCreateItemsSection.tsx`

**Files:**
- Create: `src/features/purchase-requests/components/create/PurchaseRequestCreateItemsSection.tsx`

**Interfaces:**
- Consumes: `PurchaseRequestItemDialog` (Task 7),
  `createPurchaseRequestFormDefaultValues` (Task 3),
  `PurchaseRequestItemFormValue` (Task 2).
- Produces: `PurchaseRequestCreateItemsSection` — `withForm(...)` component,
  `{form, disabled}` render signature.

- [ ] **Step 1: Write the file**

```tsx
import { useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { IconButton } from "@/components/shared/IconButton"
import { TableEmptyRow } from "@/components/shared/TableEmptyRow"
import { withForm } from "@/hooks/use-app-form"
import { PurchaseRequestItemDialog } from "@/features/purchase-requests/components/create/PurchaseRequestItemDialog"
import { createPurchaseRequestFormDefaultValues } from "@/features/purchase-requests/schemas/create-purchase-request.schema"
import type { PurchaseRequestItemFormValue } from "@/features/purchase-requests/schemas/purchase-request-item-form.schema"

export const PurchaseRequestCreateItemsSection = withForm({
  defaultValues: createPurchaseRequestFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)

    return (
      <form.Field name="items" mode="array">
        {(itemsField) => {
          const items = itemsField.state.value
          const editingItem =
            editingIndex !== null ? (items[editingIndex] ?? null) : null

          const openAdd = () => {
            setEditingIndex(null)
            setDialogOpen(true)
          }

          const openEdit = (index: number) => {
            setEditingIndex(index)
            setDialogOpen(true)
          }

          const handleSubmit = (value: PurchaseRequestItemFormValue) => {
            if (editingIndex === null) {
              itemsField.pushValue(value)
            } else {
              itemsField.replaceValue(editingIndex, value)
            }
            setDialogOpen(false)
          }

          return (
            <div className="px-4 py-5 sm:px-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading text-base font-semibold text-foreground">
                    Danh sách vật tư
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Đề xuất cần ít nhất một dòng vật tư
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="border-primary/40 text-xs text-primary hover:bg-primary/5 hover:text-primary"
                  disabled={disabled}
                  onClick={openAdd}
                >
                  <Plus className="size-4" />
                  Thêm vật tư
                </Button>
              </div>

              <div className="mt-4 overflow-hidden rounded-md border border-dashed border-border/50 bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="h-12 hover:bg-muted/45">
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Vật tư</TableHead>
                      <TableHead className="text-right">Số lượng</TableHead>
                      <TableHead>Ghi chú</TableHead>
                      <TableHead className="w-24 text-right">
                        Thao tác
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableEmptyRow
                        colSpan={5}
                        message="Đề xuất cần ít nhất một dòng vật tư. Bấm “Thêm vật tư” để thêm."
                      />
                    ) : (
                      items.map((item, index) => (
                        <TableRow
                          key={index}
                          className="h-14 bg-card hover:bg-muted/25"
                        >
                          <TableCell className="text-muted-foreground">
                            {index + 1}
                          </TableCell>
                          <TableCell>{item.itemLabel || "—"}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="max-w-40 truncate text-muted-foreground">
                            {item.note || "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <IconButton
                                label={`Sửa dòng ${index + 1}`}
                                className="text-muted-foreground hover:border-primary/30 hover:text-primary"
                                disabled={disabled}
                                onClick={() => openEdit(index)}
                              >
                                <Pencil className="size-3.5" />
                              </IconButton>
                              <IconButton
                                label={`Xóa dòng ${index + 1}`}
                                className="text-muted-foreground hover:border-destructive/30 hover:text-destructive"
                                disabled={disabled}
                                onClick={() => itemsField.removeValue(index)}
                              >
                                <Trash2 className="size-3.5" />
                              </IconButton>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <PurchaseRequestItemDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                initialValue={editingItem}
                onSubmit={handleSubmit}
              />
            </div>
          )
        }}
      </form.Field>
    )
  },
})
```

- [ ] **Step 2: Verify** — `pnpm typecheck` clean.

---

### Task 9: `components/create/PurchaseRequestCreateSummaryCard.tsx`

**Files:**
- Create: `src/features/purchase-requests/components/create/PurchaseRequestCreateSummaryCard.tsx`

**Interfaces:**
- Consumes: `createPurchaseRequestFormDefaultValues` (Task 3),
  `departmentOptionsQueryOptions` (`@/features/departments/api`),
  `PurchaseRequestStatus`/`purchaseRequestStatusLabels`
  (`@/lib/types/purchase-request.type`).
- Produces: `PurchaseRequestCreateSummaryCard` — `withForm(...)` component,
  `{form}` render signature (no `disabled` prop — read-only display).

- [ ] **Step 1: Write the file**

```tsx
import { useQuery } from "@tanstack/react-query"
import { DateTime } from "luxon"

import { withForm } from "@/hooks/use-app-form"
import { departmentOptionsQueryOptions } from "@/features/departments/api"
import { createPurchaseRequestFormDefaultValues } from "@/features/purchase-requests/schemas/create-purchase-request.schema"
import {
  PurchaseRequestStatus,
  purchaseRequestStatusLabels,
} from "@/lib/types/purchase-request.type"
import { cn } from "@/lib/utils"

// 3 bước đầu của vòng đời PR (bỏ REJECTED — đây là preview cho 1 đề xuất chưa tồn tại, chỉ
// cần thể hiện đường đi thuận, không cần nhánh từ chối).
const SUMMARY_STEPS = [
  PurchaseRequestStatus.DRAFT,
  PurchaseRequestStatus.PENDING_APPROVAL,
  PurchaseRequestStatus.APPROVED,
]

export const PurchaseRequestCreateSummaryCard = withForm({
  defaultValues: createPurchaseRequestFormDefaultValues,
  props: {},
  render: function Render({ form }) {
    const { data: departments = [] } = useQuery(
      departmentOptionsQueryOptions()
    )

    return (
      <form.Subscribe
        selector={(state) => ({
          items: state.values.items,
          departmentId: state.values.departmentId,
          neededDate: state.values.neededDate,
        })}
      >
        {({ items, departmentId, neededDate }) => {
          const totalQuantity = items.reduce(
            (sum, item) => sum + (Number(item.quantity) || 0),
            0
          )
          const department = departments.find((d) => d.id === departmentId)
          const neededDateLabel =
            neededDate.length > 0
              ? DateTime.fromISO(neededDate).toFormat("dd/MM/yyyy")
              : "—"

          return (
            <div className="space-y-5">
              <div>
                <h2 className="font-heading text-base font-semibold text-foreground">
                  Tóm tắt đề xuất
                </h2>
                <p className="text-sm text-muted-foreground">
                  Xem lại trước khi tạo
                </p>
              </div>

              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Số dòng vật tư</dt>
                  <dd className="font-medium tabular-nums text-foreground">
                    {items.length}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Tổng số lượng</dt>
                  <dd className="font-medium tabular-nums text-foreground">
                    {totalQuantity}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Phòng ban</dt>
                  <dd className="font-medium text-foreground">
                    {department?.name ?? "Chưa chọn"}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Ngày cần hàng</dt>
                  <dd className="font-medium text-foreground">
                    {neededDateLabel}
                  </dd>
                </div>
              </dl>

              <div className="space-y-2 border-t border-border pt-4">
                <p className="text-xs font-medium text-foreground">
                  Quy trình duyệt
                </p>
                <ul className="space-y-2">
                  {SUMMARY_STEPS.map((step, index) => (
                    <li key={step} className="flex items-center gap-2 text-xs">
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                          index === 0
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {index + 1}
                      </span>
                      <span
                        className={
                          index === 0
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {purchaseRequestStatusLabels[step]}
                      </span>
                      {index === 0 ? (
                        <span className="ml-auto text-[10px] text-primary">
                          Sẽ tạo ở đây
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        }}
      </form.Subscribe>
    )
  },
})
```

- [ ] **Step 2: Verify** — `pnpm typecheck` clean.

---

### Task 10: `components/create/PurchaseRequestCreateForm.tsx`

**Files:**
- Create: `src/features/purchase-requests/components/create/PurchaseRequestCreateForm.tsx`

**Interfaces:**
- Consumes: `PurchaseRequestCreateHeaderSection` (Task 6),
  `PurchaseRequestCreateItemsSection` (Task 8),
  `PurchaseRequestCreateSummaryCard` (Task 9),
  `createPurchaseRequestFormDefaultValues`/`createPurchaseRequestSchema`/
  `CreatePurchaseRequestSchema` (Task 3), `createPurchaseRequest` (Task 5).
- Produces: `PurchaseRequestCreateForm()`.

- [ ] **Step 1: Write the file**

```tsx
import { useEffect, useRef } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { FileText, Loader2, RotateCcw, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { restoreFormDraft, useFormDraft } from "@/hooks/use-form-draft"
import { PurchaseRequestCreateHeaderSection } from "@/features/purchase-requests/components/create/PurchaseRequestCreateHeaderSection"
import { PurchaseRequestCreateItemsSection } from "@/features/purchase-requests/components/create/PurchaseRequestCreateItemsSection"
import { PurchaseRequestCreateSummaryCard } from "@/features/purchase-requests/components/create/PurchaseRequestCreateSummaryCard"
import { createPurchaseRequest } from "@/features/purchase-requests/api/server-functions/create-purchase-request.api"
import {
  createPurchaseRequestFormDefaultValues,
  createPurchaseRequestSchema,
} from "@/features/purchase-requests/schemas/create-purchase-request.schema"
import type { CreatePurchaseRequestSchema } from "@/features/purchase-requests/schemas/create-purchase-request.schema"

export function PurchaseRequestCreateForm() {
  const navigate = useNavigate({ from: "/manage/purchase-requests/create" })
  const queryClient = useQueryClient()
  const createPurchaseRequestFn = useServerFn(createPurchaseRequest)

  const { draft, saveDraft, clearDraft } =
    useFormDraft<CreatePurchaseRequestSchema>(
      "qlsx:draft:create-purchase-request"
    )
  const draftRestoredRef = useRef(false)

  // Trả về {id} (khác createOrder/createInventoryReceipt trả void) — điều hướng thẳng sang
  // trang chi tiết vừa tạo thay vì quay về danh sách, theo quyết định đã chốt với user.
  const { mutate: create, isPending } = useMutation({
    mutationFn: (value: CreatePurchaseRequestSchema) =>
      createPurchaseRequestFn({ data: value }),
    onSuccess: async ({ id }) => {
      clearDraft()
      await queryClient.invalidateQueries({ queryKey: ["purchase-requests"] })
      toast.success("Đã tạo đề xuất mua hàng")
      await navigate({
        to: "/manage/purchase-requests/$purchaseRequestId",
        params: { purchaseRequestId: id },
      })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: createPurchaseRequestFormDefaultValues,
    validators: {
      onSubmit: createPurchaseRequestSchema,
    },
    onSubmit: ({ value }) => create(value),
  })

  // Auto-restore a saved draft into the form once, after localStorage hydrates.
  useEffect(() => {
    if (!draftRestoredRef.current && draft) {
      draftRestoredRef.current = true
      restoreFormDraft(form, draft)
    }
  }, [draft, form])

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
      noValidate
      className="space-y-6"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="overflow-hidden rounded-lg bg-card shadow-card">
          <PurchaseRequestCreateHeaderSection
            form={form}
            disabled={isPending}
          />

          <div className="border-t border-border">
            <PurchaseRequestCreateItemsSection
              form={form}
              disabled={isPending}
            />
          </div>
        </div>

        <div className="sticky top-6 h-fit rounded-lg bg-card p-4 shadow-card sm:p-5">
          <PurchaseRequestCreateSummaryCard form={form} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-card px-4 py-4 shadow-card sm:px-5">
        <Button
          type="button"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
          disabled={isPending}
          onClick={() =>
            void navigate({
              to: "/manage/purchase-requests",
              search: { page: 1, limit: 10 },
            })
          }
        >
          Hủy
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={isPending}
            onClick={() => {
              form.reset()
              restoreFormDraft(form, createPurchaseRequestFormDefaultValues)
              clearDraft()
            }}
          >
            <RotateCcw className="size-4" />
            Đặt lại
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => {
              saveDraft(form.state.values)
              toast.success("Đã lưu nháp")
            }}
          >
            <FileText className="size-4" />
            Lưu nháp
          </Button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting || isPending}
              >
                {isSubmitting || isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Đang lưu
                  </>
                ) : (
                  <>
                    <Save />
                    Tạo đề xuất
                  </>
                )}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Verify** — `pnpm typecheck` clean.

---

### Task 11: Page + route

**Files:**
- Create: `src/features/purchase-requests/pages/PurchaseRequestCreatePage.tsx`
- Create: `src/routes/(authed)/manage_/purchase-requests_/create.tsx`

**Interfaces:**
- Consumes: `PurchaseRequestCreateForm` (Task 10), `requirePermission`
  (`@/features/auth/guard`).

- [ ] **Step 1: `PurchaseRequestCreatePage.tsx`**

```tsx
import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { PurchaseRequestCreateForm } from "@/features/purchase-requests/components/create/PurchaseRequestCreateForm"

export function PurchaseRequestCreatePage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Tạo đề xuất mua hàng"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Quản lý mua hàng" },
          { label: "Đề xuất mua hàng", href: "/manage/purchase-requests" },
          { label: "Tạo đề xuất mua hàng" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <PurchaseRequestCreateForm />
      </div>
    </main>
  )
}
```

- [ ] **Step 2: `src/routes/(authed)/manage_/purchase-requests_/create.tsx`**

```tsx
import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { PurchaseRequestCreatePage } from "@/features/purchase-requests/pages/PurchaseRequestCreatePage"

// No loader: Phòng ban là 1 useQuery nhỏ trong header section — không có gì cần prefetch
// (cùng lý do inventory-receipts_/create.tsx không có loader).
export const Route = createFileRoute(
  "/(authed)/manage_/purchase-requests_/create"
)({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "purchase-requests:create"),
  component: PurchaseRequestCreatePage,
})
```

- [ ] **Step 3: Regenerate the route tree** — briefly run `pnpm dev` (or
  `pnpm build`) so the TanStack Start Vite plugin picks up the new route file
  into `src/routeTree.gen.ts` (auto-generated, never hand-edit). Confirm
  `grep -c "purchase-requests_/create" src/routeTree.gen.ts` is non-zero,
  then stop the dev server.

- [ ] **Step 4: Verify** — `pnpm typecheck` clean (this is the step where
  `useNavigate({from: "/manage/purchase-requests/create"})` in Task 10 and
  the `to`/`params` literals type-check against the regenerated route tree).

---

### Task 12: Wire the list page's "Tạo đề xuất mua hàng (Manual)" button

**Files:**
- Modify: `src/features/purchase-requests/components/PurchaseRequestsTableFilter.tsx`

**Interfaces:** No new exports — replaces the disabled `PendingAction`
placeholder with a real, permission-gated `Link`.

- [ ] **Step 1: Edit imports** — merge `Link` into the existing
  `@tanstack/react-router` import (line 2), drop the now-unused `PendingAction`
  import, add `PermissionGate`:

Replace:
```tsx
import { useNavigate, useSearch } from "@tanstack/react-router"
```
with:
```tsx
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
```

Replace:
```tsx
import { PendingAction } from "@/components/shared/PendingAction"
```
with:
```tsx
import { PermissionGate } from "@/components/shared/PermissionGate"
```

- [ ] **Step 2: Replace the placeholder button** (currently lines 211-221) —
  keep the exact existing label and `variant="default"` (see "Scope
  decisions" above: this copy already matches the reference mockup):

Replace:
```tsx
            {/* variant="default" (primary), not the outline every other PendingAction uses — matches
                the reference mockup (UI_PR_01) exactly, which shows this button primary-colored even
                though the create screen isn't built yet. Deliberate deviation, not a missed rename. */}
            <PendingAction
              label="Tạo đề xuất mua hàng (Manual)"
              hint="Màn hình tạo đề xuất mua hàng sắp có"
              variant="default"
            >
              <Plus className="size-4" />
              Tạo đề xuất mua hàng (Manual)
            </PendingAction>
```
with:
```tsx
            <PermissionGate permission="purchase-requests:create">
              <Button asChild className="text-xs">
                <Link to="/manage/purchase-requests/create">
                  <Plus className="size-4" />
                  Tạo đề xuất mua hàng (Manual)
                </Link>
              </Button>
            </PermissionGate>
```

- [ ] **Step 3: Verify** — `pnpm typecheck` clean (the `<Link to>` literal
  type-checks against the routeTree regenerated in Task 11), `pnpm exec
  eslint src/features/purchase-requests/components/PurchaseRequestsTableFilter.tsx`
  clean (confirms `PendingAction` import removal left no unused import).

---

### Task 13: Wire the list page's empty state

**Files:**
- Modify: `src/features/purchase-requests/pages/PurchaseRequestsPage.tsx`

**Interfaces:** No new exports — adds an `action` to the existing
`TableEmptyState`.

- [ ] **Step 1: Edit imports** — add `Link` (merge into the existing
  `@tanstack/react-router` import), `PermissionGate`, `Plus`, `Button`:

Replace:
```tsx
import { useSearch } from "@tanstack/react-router"
```
with:
```tsx
import { Link, useSearch } from "@tanstack/react-router"
```

Add, alongside the other `@/components/*` imports:
```tsx
import { Button } from "@/components/ui/button"
import { PermissionGate } from "@/components/shared/PermissionGate"
```

Replace:
```tsx
import { ClipboardList } from "lucide-react"
```
with:
```tsx
import { ClipboardList, Plus } from "lucide-react"
```

- [ ] **Step 2: Replace the empty state** — drop the stale comment (creation
  is now built) and add `action`:

Replace:
```tsx
              emptyState={
                // No action button — creation isn't built yet (giai đoạn 1
                // chỉ có GET /purchase-requests).
                <TableEmptyState
                  icon={ClipboardList}
                  title="Chưa có đề xuất mua hàng nào"
                  description="Đề xuất mua hàng sẽ hiển thị tại đây khi được tạo."
                />
              }
```
with:
```tsx
              emptyState={
                <TableEmptyState
                  icon={ClipboardList}
                  title="Chưa có đề xuất mua hàng nào"
                  description="Đề xuất mua hàng sẽ hiển thị tại đây khi được tạo."
                  action={
                    <PermissionGate permission="purchase-requests:create">
                      <Button asChild size="sm" className="text-xs">
                        <Link to="/manage/purchase-requests/create">
                          <Plus className="size-4" />
                          Tạo đề xuất mua hàng (Manual)
                        </Link>
                      </Button>
                    </PermissionGate>
                  }
                />
              }
```

- [ ] **Step 3: Verify** — `pnpm typecheck` clean, `pnpm exec eslint
  src/features/purchase-requests/pages/PurchaseRequestsPage.tsx` clean.

---

### Task 14: Full verification pass

- [ ] **Step 1: `pnpm typecheck`** — clean across the whole repo.
- [ ] **Step 2: `pnpm exec eslint <every file touched/created above>`** —
  clean. Note the top-level `import type` convention (ESLint catches this,
  `tsc` does not).
- [ ] **Step 3: `pnpm format`** — no diffs beyond what was already
  hand-formatted per the codebase's Prettier config.
- [ ] **Step 4: Manual `pnpm dev` walkthrough:**
  - Navigate `/manage/purchase-requests` → the filter bar's "Tạo đề xuất mua
    hàng (Manual)" button is now a real, enabled link (no tooltip) → click
    it → lands on `/manage/purchase-requests/create`.
  - Header shows "Đề xuất mua hàng" / "Mã đề xuất: sẽ cấp sau khi lưu",
    Phòng ban select lists real departments, Ngày cần hàng date picker
    works.
  - Sidebar "Tóm tắt đề xuất" updates live as Phòng ban/Ngày cần hàng are
    filled and items are added/removed (item count, total quantity,
    department name, formatted date all update; step 1 of the 3-step list
    is highlighted).
  - Click "Thêm vật tư" → dialog opens, material combobox searches/filters
    (confirm only RM-type materials appear, not finished goods), fill
    Số lượng + Ghi chú, Lưu → row appears in the table.
  - Try submitting with zero items → inline validation blocks submit
    ("Đề xuất cần ít nhất một dòng vật tư").
  - Fill Phòng ban + Ngày cần hàng + at least one item, submit → whatever
    the backend actually does today (success or a "not found"/404-shaped
    error) — confirm the error path renders a clean toast, not a raw
    stack trace or unhandled rejection, and the console has no uncaught
    errors. If `POST /api/purchase-requests` succeeds, confirm the redirect
    lands on `/manage/purchase-requests/$purchaseRequestId` for the new id
    and `toast.success("Đã tạo đề xuất mua hàng")` fires.
  - "Lưu nháp" → toast "Đã lưu nháp"; reload the create page → form restores
    the saved draft values.
  - "Đặt lại" → form clears back to defaults and the saved draft is cleared
    (reload confirms no restore).
  - Back on `/manage/purchase-requests`, temporarily filter to a status with
    zero rows (or check with a role lacking `purchase-requests:create`) to
    confirm the empty-state action button only renders for a user holding
    the permission.
  - No console errors throughout.
- [ ] **Step 5: `git status` / `git diff`** — confirm only the files listed
  in this plan changed, no stray `console.log` or leftover debug code.

---

## Self-review

**Spec coverage:** all 4 confirmed scope decisions are implemented — RM-only
material picker (Task 4's `type: "RM"`, Task 7's dialog), navigate-to-detail
on success (Task 5's `{id}` return + Task 10's `onSuccess`), no stock
preview (Task 7 has only material/quantity/note), single "Tạo đề xuất"
button (Task 10, no combined send button). The existing "Tạo đề xuất mua
hàng (Manual)" placeholder button is wired up preserving its exact label/
style (Task 12). Domain model constraints honored: no header `note`/`reason`
field, no `itemUnit`/ĐVT column, `requesterBy`/`productionOrder`/
`productionJob` never form fields. UI design (2-column layout, drafting
header, summary sidebar with stepper) fully covered by Tasks 6, 8, 9, 10.

**Placeholder scan:** none — every step has complete, runnable code; Task 5's
error resolver has only a `default` branch by design (documented reason: the
backend endpoint doesn't exist yet), not a placeholder omission.

**Type consistency:** `PurchaseRequestItemFormValue` (Task 2) is the type
used consistently by the item dialog (Task 7) and items section (Task 8),
nowhere renamed. `CreatePurchaseRequestSchema`/`createPurchaseRequestFormDefaultValues`
(Task 3) are the exact names imported by Tasks 6, 8, 9, 10 as each
`withForm`'s `defaultValues`. `createPurchaseRequest`'s return type
`{id: string}` (Task 5) matches the `onSuccess: async ({id}) => ...`
destructure in Task 10. Route id `/(authed)/manage_/purchase-requests_/create`
(Task 11) matches the `useNavigate({from: ...})` string in Task 10. Route
path `/manage/purchase-requests/create` (Task 11's file location) matches
every `<Link to="/manage/purchase-requests/create">` in Tasks 12-13.
