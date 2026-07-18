# Create Supplier Form Implementation Plan

> **For agentic workers:** This plan is executed inline in the same session
> (no subagent dispatch — the feature is cohesive and the author already has
> full context). Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Note on verification:** This repo has no test suite (`CLAUDE.md`: "There
> are currently no test files in the repo"). Per `CLAUDE.md`'s actual
> Definition of Done, "test" steps below mean `pnpm typecheck` /
> `pnpm exec eslint` / manual `pnpm dev` verification — not TDD unit tests.

**Goal:** Build the "Thêm nhà cung cấp" (Create Supplier) form matching the
provided mockup, wired to the real `POST /api/suppliers` endpoint, with real
logo/attachment uploads.

**Architecture:** Mirrors `src/features/users/components/CreateUserForm.tsx`
exactly — `useAppForm`/`withForm`/`AppFormFields` + `createServerFn` +
`useMutation`. Three new feature-local field components (logo, attachments,
rating) follow `UserAvatarField.tsx`'s exact shape (raw `form.Field` render
prop, own dropzone/upload logic, not part of the shared `AppFormFields`).

**Tech Stack:** TanStack Form (`useAppForm`), TanStack Query (`useMutation`),
Zod v4, `react-dropzone` (already a dependency, used by `UserAvatarField`),
`lucide-react` icons.

## Global Constraints

- Domain values stay language-neutral (`SupplierType.COMPANY`, not
  `"Công ty"`), mapped to Vietnamese via `*_LABELS` maps at the display edge.
- Server functions: `GENERIC_ERROR_MESSAGE` + `resolve<Name>ErrorMessage`
  (switch on `errorCode`, always a `default` branch) + try/catch +
  `logHttpError`. Never surface raw backend error strings.
- No `any`, `@ts-ignore`, non-null `!`. `import type` for type-only imports.
- `pnpm typecheck` and `pnpm exec eslint <file>` clean after every file group
  below; `pnpm format` before final review.

---

## Scope decisions (confirmed with user)

- **Create only** — no Edit page this pass.
- **Trạng thái**: all 3 `SupplierStatus` values shown as radio options
  (mockup only shows 2 — user chose to show the real enum), default
  `ACTIVE`.
- **Logo + Tài liệu đính kèm**: wired to real upload endpoints
  (`POST /api/uploads`, `POST /api/uploads/document`) — not placeholders.
- **"Lưu nháp"**: inert placeholder button (`type="button"`, no handler) —
  backend has no draft concept, matches existing placeholder-button
  convention used elsewhere in this feature (list page's action icons).
- **Layout deviates from `CreateUserForm`**: Block 1 is a full-width card;
  Blocks 2 + 3 render as two side-by-side cards (`grid-cols-2` on `lg+`)
  below it, matching the mockup — Users' sections all stack in one card.
- **Field grid**: uses the existing 2-column (`sm:grid-cols-2`) convention
  from `CreateUserInfoSection`, not the mockup's wider 4-column arrangement
  — consistent with the codebase's responsive grid pattern elsewhere.

---

### Task 1: Add missing label maps to `supplier.type.ts`

**Files:**
- Modify: `src/features/suppliers/types/supplier.type.ts`
- Create: type `SupplierAttachmentInput` (request-shape attachment, no `id`)

**Interfaces:**
- Produces: `SUPPLIER_TYPE_LABELS: Record<SupplierType, string>`,
  `PAYMENT_METHOD_LABELS: Record<PaymentMethod, string>`,
  `PAYMENT_TERM_LABELS: Record<PaymentTerm, string>`,
  `SupplierAttachmentInput = {url: string; filename: string; mimetype: string | null; size: number | null}`

- [ ] **Step 1: Edit the file** — insert label maps immediately after each
  enum, and the new type after `SupplierAttachment`:

```ts
export enum SupplierType {
  INDIVIDUAL = "INDIVIDUAL",
  COMPANY = "COMPANY",
  HOUSEHOLD = "HOUSEHOLD",
}

export const SUPPLIER_TYPE_LABELS: Record<SupplierType, string> = {
  [SupplierType.INDIVIDUAL]: "Cá nhân",
  [SupplierType.COMPANY]: "Công ty",
  [SupplierType.HOUSEHOLD]: "Hộ kinh doanh",
}

export enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: "Tiền mặt",
  [PaymentMethod.BANK_TRANSFER]: "Chuyển khoản",
}

export enum PaymentTerm {
  IMMEDIATE = "IMMEDIATE",
  NET_15 = "NET_15",
  NET_30 = "NET_30",
  NET_60 = "NET_60",
}

export const PAYMENT_TERM_LABELS: Record<PaymentTerm, string> = {
  [PaymentTerm.IMMEDIATE]: "Thanh toán ngay",
  [PaymentTerm.NET_15]: "Net 15 ngày",
  [PaymentTerm.NET_30]: "Net 30 ngày",
  [PaymentTerm.NET_60]: "Net 60 ngày",
}
```

  And after the `SupplierAttachment` type:

```ts
/** Attachment item shape when creating/updating a supplier (no `id` yet — the
 *  backend assigns one only after the file is attached to a saved supplier). */
export type SupplierAttachmentInput = {
  url: string
  filename: string
  mimetype: string | null
  size: number | null
}
```

- [ ] **Step 2: Verify** — `pnpm typecheck` clean (no consumers yet, so this
  should be a pure addition with zero errors).

---

### Task 2: `create-supplier.schema.ts`

**Files:**
- Create: `src/features/suppliers/schemas/create-supplier.schema.ts`

**Interfaces:**
- Consumes: `SupplierType`, `SupplierStatus`, `PaymentMethod`, `PaymentTerm`
  from Task 1.
- Produces: `createSupplierSchema`, `CreateSupplierSchema` (type),
  `CREATE_SUPPLIER_DEFAULT_VALUES`.

- [ ] **Step 1: Write the file**

```ts
import { DateTime } from "luxon"
import { z } from "zod"

import {
  PaymentMethod,
  PaymentTerm,
  SupplierStatus,
  SupplierType,
} from "@/features/suppliers/types/supplier.type"

// A blank form input means "not provided" — the wire payload should omit the
// field rather than send an empty string.
function emptyToUndefined(value: string): string | undefined {
  return value.length > 0 ? value : undefined
}

function emptyToUndefinedNumber(value: string): number | undefined {
  return value.length > 0 ? Number(value) : undefined
}

// Wire contract for POST /api/suppliers' `payment` field — matches the
// backend's nested payment DTO. Always sent (the form always shows this
// block), every sub-field individually optional.
const supplierPaymentFields = {
  bankName: z.string().trim().transform(emptyToUndefined),
  bankAccountNumber: z.string().trim().transform(emptyToUndefined),
  bankAccountHolder: z.string().trim().transform(emptyToUndefined),
  bankBranch: z.string().trim().transform(emptyToUndefined),
  defaultPaymentMethod: z
    .union([z.enum(PaymentMethod), z.literal("")])
    .transform((value) => (value === "" ? undefined : value)),
  defaultPaymentTerm: z
    .union([z.enum(PaymentTerm), z.literal("")])
    .transform((value) => (value === "" ? undefined : value)),
  creditLimit: z
    .string()
    .trim()
    .transform(emptyToUndefinedNumber)
    .refine((value) => value === undefined || value >= 0, {
      message: "Hạn mức công nợ không được âm",
    }),
  creditLimitStartDate: z
    .string()
    .trim()
    .transform((value) =>
      value.length > 0
        ? DateTime.fromISO(value).toJSDate().toISOString()
        : undefined
    ),
}

const createSupplierPaymentSchema = z.object(supplierPaymentFields)

// The company email is optional, so it only needs a format check when filled
// (email is already transformed to undefined-when-empty by supplierProfileFields
// by the time this runs).
function refineSupplierEmail(
  value: { email?: string },
  ctx: z.RefinementCtx
): void {
  if (value.email && !z.email().safeParse(value.email).success) {
    ctx.addIssue({
      code: "custom",
      path: ["email"],
      message: "Email không đúng định dạng",
    })
  }
}

const supplierProfileFields = {
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên nhà cung cấp")
    .max(255, "Tên nhà cung cấp tối đa 255 ký tự"),
  supplierGroupId: z.string().trim().min(1, "Vui lòng chọn nhóm nhà cung cấp"),
  type: z.enum(SupplierType),
  taxCode: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mã số thuế")
    .max(50, "Mã số thuế tối đa 50 ký tự"),
  phoneNumber: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập số điện thoại")
    .max(30, "Số điện thoại tối đa 30 ký tự"),
  email: z.string().trim().transform(emptyToUndefined),
  representativeName: z.string().trim().transform(emptyToUndefined),
  representativePhone: z.string().trim().transform(emptyToUndefined),
  address: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập địa chỉ")
    .max(500, "Địa chỉ tối đa 500 ký tự"),
  note: z
    .string()
    .trim()
    .max(1000, "Ghi chú tối đa 1000 ký tự")
    .transform(emptyToUndefined),
  logoUrl: z.string().trim().transform(emptyToUndefined),
  countryId: z.string().trim().transform(emptyToUndefined),
  rating: z.string().trim().transform(emptyToUndefinedNumber),
  status: z.enum(SupplierStatus),
  internalNote: z
    .string()
    .trim()
    .max(1000, "Ghi chú nội bộ tối đa 1000 ký tự")
    .transform(emptyToUndefined),
  attachments: z.array(
    z.object({
      url: z.string(),
      filename: z.string(),
      mimetype: z.string().nullable(),
      size: z.number().nullable(),
    })
  ),
}

export const createSupplierSchema = z
  .object({
    ...supplierProfileFields,
    payment: createSupplierPaymentSchema,
  })
  .superRefine(refineSupplierEmail)

export type CreateSupplierSchema = z.input<typeof createSupplierSchema>

export const CREATE_SUPPLIER_DEFAULT_VALUES: CreateSupplierSchema = {
  name: "",
  supplierGroupId: "",
  type: SupplierType.COMPANY,
  taxCode: "",
  phoneNumber: "",
  email: "",
  representativeName: "",
  representativePhone: "",
  address: "",
  note: "",
  logoUrl: "",
  countryId: "",
  rating: "",
  status: SupplierStatus.ACTIVE,
  internalNote: "",
  attachments: [],
  payment: {
    bankName: "",
    bankAccountNumber: "",
    bankAccountHolder: "",
    bankBranch: "",
    defaultPaymentMethod: "",
    defaultPaymentTerm: "",
    creditLimit: "",
    creditLimitStartDate: "",
  },
}
```

- [ ] **Step 2: Verify** — `pnpm typecheck` clean.

---

### Task 3: Server functions — create + 2 uploads

**Files:**
- Create: `src/features/suppliers/server-functions/create-supplier.ts`
- Create: `src/features/suppliers/server-functions/upload-supplier-logo.ts`
- Create: `src/features/suppliers/server-functions/upload-supplier-document.ts`

**Interfaces:**
- Consumes: `createSupplierSchema` (Task 2), `http`/`logHttpError`
  (`src/lib/http.ts`), `Supplier` type (Task 1).
- Produces: `createSupplier(data) => Promise<Supplier>`,
  `uploadSupplierLogo(FormData) => Promise<{url: string}>`,
  `uploadSupplierDocument(FormData) => Promise<UploadedDocument>` where
  `UploadedDocument = {url: string; filename: string; mimetype: string; size: number}`.

- [ ] **Step 1: `create-supplier.ts`**

```ts
import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createSupplierSchema } from "@/features/suppliers/schemas/create-supplier.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { Supplier } from "@/features/suppliers/types/supplier.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateSupplierErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "supplier.error.tax_code_exists":
      return "Mã số thuế đã tồn tại."
    case "supplier.error.code_exists":
      return "Mã nhà cung cấp đã tồn tại."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const createSupplier = createServerFn({ method: "POST" })
  .validator(createSupplierSchema)
  .handler(async ({ data }): Promise<Supplier> => {
    try {
      const response = await http.post<Supplier>("/api/suppliers", data)

      return response.data
    } catch (error) {
      logHttpError(error, "createSupplier")

      throw new Error(resolveCreateSupplierErrorMessage(error))
    }
  })
```

- [ ] **Step 2: `upload-supplier-logo.ts`**

```ts
import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUploadSupplierLogoErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "upload.error.invalid_file":
      return "Định dạng ảnh không hợp lệ."
    case "upload.error.file_too_large":
      return "Kích thước ảnh vượt quá giới hạn cho phép."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

function validateLogoFormData(data: unknown): FormData {
  if (!(data instanceof FormData) || !(data.get("file") instanceof File)) {
    throw new Error(GENERIC_ERROR_MESSAGE)
  }

  return data
}

export const uploadSupplierLogo = createServerFn({ method: "POST" })
  .validator(validateLogoFormData)
  .handler(async ({ data }): Promise<{ url: string }> => {
    try {
      const response = await http.post<{ url: string }>("/api/uploads", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      return response.data
    } catch (error) {
      logHttpError(error, "uploadSupplierLogo")

      throw new Error(resolveUploadSupplierLogoErrorMessage(error))
    }
  })
```

- [ ] **Step 3: `upload-supplier-document.ts`**

```ts
import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUploadSupplierDocumentErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "upload.error.invalid_file":
      return "Định dạng file không hợp lệ."
    case "upload.error.file_too_large":
      return "Kích thước file vượt quá giới hạn cho phép."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

function validateDocumentFormData(data: unknown): FormData {
  if (!(data instanceof FormData) || !(data.get("file") instanceof File)) {
    throw new Error(GENERIC_ERROR_MESSAGE)
  }

  return data
}

export type UploadedDocument = {
  url: string
  filename: string
  mimetype: string
  size: number
}

export const uploadSupplierDocument = createServerFn({ method: "POST" })
  .validator(validateDocumentFormData)
  .handler(async ({ data }): Promise<UploadedDocument> => {
    try {
      const response = await http.post<UploadedDocument>(
        "/api/uploads/document",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "uploadSupplierDocument")

      throw new Error(resolveUploadSupplierDocumentErrorMessage(error))
    }
  })
```

- [ ] **Step 4: Verify** — `pnpm typecheck` clean.

---

### Task 4: New field components — logo, attachments, rating

**Files:**
- Create: `src/features/suppliers/components/SupplierLogoField.tsx`
- Create: `src/features/suppliers/components/SupplierAttachmentsField.tsx`
- Create: `src/features/suppliers/components/SupplierRatingField.tsx`

**Interfaces:**
- Consumes: `uploadSupplierLogo`/`uploadSupplierDocument` (Task 3),
  `SupplierAttachmentInput` (Task 1).
- Produces: `SupplierLogoField({value, onChange, disabled})`,
  `SupplierAttachmentsField({value, onChange, disabled})`,
  `SupplierRatingField({value, onChange, disabled})` — all raw
  `value:string`/`onChange:(v)=>void` prop shapes matching
  `UserAvatarField`'s contract, for use inside `<form.Field>` render props
  (not `form.AppField` — these aren't in the shared `AppFormFields` set).

- [ ] **Step 1: `SupplierLogoField.tsx`** (mirrors `UserAvatarField.tsx`,
  square not circular, larger dropzone per the mockup)

```tsx
import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import { ImageUp, Loader2 } from "lucide-react"
import { ErrorCode, useDropzone } from "react-dropzone"

import { uploadSupplierLogo } from "@/features/suppliers/server-functions/upload-supplier-logo"
import { cn } from "@/lib/utils"
import type { FileRejection } from "react-dropzone"

const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024
const ACCEPTED_LOGO_TYPES = { "image/jpeg": [], "image/png": [] }

function resolveDropRejectionMessage(
  rejections: FileRejection[]
): string | null {
  switch (rejections[0]?.errors[0]?.code) {
    case ErrorCode.FileInvalidType:
      return "Chỉ chấp nhận định dạng JPG, PNG."
    case ErrorCode.FileTooLarge:
      return "Kích thước ảnh tối đa 2MB."
    case ErrorCode.TooManyFiles:
      return "Chỉ được chọn 1 ảnh."
    default:
      return rejections.length > 0 ? "Không thể tải ảnh lên." : null
  }
}

type SupplierLogoFieldProps = {
  value: string
  onChange: (url: string) => void
  disabled?: boolean
}

export function SupplierLogoField({
  value,
  onChange,
  disabled,
}: SupplierLogoFieldProps) {
  const [clientError, setClientError] = useState<string | null>(null)
  const uploadLogoFn = useServerFn(uploadSupplierLogo)

  const {
    mutate: upload,
    error,
    isPending,
  } = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      return uploadLogoFn({ data: formData })
    },
    onSuccess: (result) => onChange(result.url),
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_LOGO_TYPES,
    maxSize: MAX_LOGO_SIZE_BYTES,
    multiple: false,
    disabled,
    onDropAccepted: ([file]) => {
      setClientError(null)
      upload(file)
    },
    onDropRejected: (rejections) =>
      setClientError(resolveDropRejectionMessage(rejections)),
  })

  const errorMessage = clientError ?? error?.message ?? null

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="self-start text-xs font-medium text-foreground">
        Logo
      </span>

      <div
        {...getRootProps({
          role: "button",
          "aria-label": "Tải logo lên",
          className: cn(
            "relative w-40 outline-none focus-visible:ring-2 focus-visible:ring-ring",
            disabled && "pointer-events-none opacity-50"
          ),
        })}
      >
        <input {...getInputProps()} />

        <div
          className={cn(
            "flex aspect-square w-40 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-lg border-2 border-dashed border-input bg-muted/40 p-3 text-center transition-colors",
            isDragActive && "border-primary bg-primary/5"
          )}
        >
          {value.length > 0 ? (
            <img
              src={value}
              alt="Logo nhà cung cấp"
              className="size-full object-cover"
            />
          ) : (
            <>
              <ImageUp className="size-6 text-muted-foreground/60" />
              <p className="text-[11px] text-muted-foreground">
                Kéo thả ảnh vào đây hoặc{" "}
                <span className="font-medium text-primary">chọn file</span>
              </p>
            </>
          )}

          {isPending ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : null}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Định dạng: JPG, PNG (tối đa 2MB)
      </p>

      {errorMessage ? (
        <p className="max-w-40 text-xs text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 2: `SupplierAttachmentsField.tsx`** (new pattern: multi-file
  dropzone, each accepted file uploads immediately, results accumulate into
  the array)

```tsx
import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import { ErrorCode, useDropzone } from "react-dropzone"
import { FileText, Loader2, Paperclip, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { uploadSupplierDocument } from "@/features/suppliers/server-functions/upload-supplier-document"
import { cn } from "@/lib/utils"
import type { SupplierAttachmentInput } from "@/features/suppliers/types/supplier.type"
import type { FileRejection } from "react-dropzone"

const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024
const ACCEPTED_DOCUMENT_TYPES = {
  "application/pdf": [],
  "application/msword": [],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    [],
  "application/vnd.ms-excel": [],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
}

function resolveDropRejectionMessage(
  rejections: FileRejection[]
): string | null {
  switch (rejections[0]?.errors[0]?.code) {
    case ErrorCode.FileInvalidType:
      return "Chỉ chấp nhận PDF, DOC, DOCX, XLS, XLSX."
    case ErrorCode.FileTooLarge:
      return "Kích thước file tối đa 10MB."
    default:
      return rejections.length > 0 ? "Không thể tải file lên." : null
  }
}

type SupplierAttachmentsFieldProps = {
  value: SupplierAttachmentInput[]
  onChange: (value: SupplierAttachmentInput[]) => void
  disabled?: boolean
}

export function SupplierAttachmentsField({
  value,
  onChange,
  disabled,
}: SupplierAttachmentsFieldProps) {
  const [clientError, setClientError] = useState<string | null>(null)
  const uploadDocumentFn = useServerFn(uploadSupplierDocument)

  const {
    mutateAsync: upload,
    error,
    isPending,
  } = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      return uploadDocumentFn({ data: formData })
    },
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_DOCUMENT_TYPES,
    maxSize: MAX_DOCUMENT_SIZE_BYTES,
    multiple: true,
    disabled,
    onDropAccepted: async (files) => {
      setClientError(null)
      const uploaded = await Promise.all(files.map((file) => upload(file)))
      onChange([
        ...value,
        ...uploaded.map((doc) => ({
          url: doc.url,
          filename: doc.filename,
          mimetype: doc.mimetype,
          size: doc.size,
        })),
      ])
    },
    onDropRejected: (rejections) =>
      setClientError(resolveDropRejectionMessage(rejections)),
  })

  const removeAttachment = (url: string) => {
    onChange(value.filter((attachment) => attachment.url !== url))
  }

  const errorMessage = clientError ?? error?.message ?? null

  return (
    <div className="space-y-2">
      <span className="block text-xs font-medium text-foreground">
        Tài liệu đính kèm
      </span>

      <div
        {...getRootProps({
          role: "button",
          "aria-label": "Tải tài liệu đính kèm lên",
          className: cn(
            "relative w-full outline-none focus-visible:ring-2 focus-visible:ring-ring",
            disabled && "pointer-events-none opacity-50"
          ),
        })}
      >
        <input {...getInputProps()} />

        <div
          className={cn(
            "flex min-h-28 w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-input bg-muted/40 p-4 text-center transition-colors",
            isDragActive && "border-primary bg-primary/5"
          )}
        >
          <Paperclip className="size-5 text-muted-foreground/60" />
          <p className="text-[11px] text-muted-foreground">
            Kéo thả file vào đây hoặc{" "}
            <span className="font-medium text-primary">chọn file</span>
          </p>
          <p className="text-[11px] text-muted-foreground">
            Hỗ trợ: PDF, DOC, DOCX, XLS, XLSX (tối đa 10MB)
          </p>

          {isPending ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/70">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : null}
        </div>
      </div>

      {errorMessage ? (
        <p className="text-xs text-destructive">{errorMessage}</p>
      ) : null}

      {value.length > 0 ? (
        <ul className="space-y-1.5">
          {value.map((attachment) => (
            <li
              key={attachment.url}
              className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2"
            >
              <span className="flex min-w-0 items-center gap-2 text-xs text-foreground">
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{attachment.filename}</span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={disabled}
                aria-label={`Xóa ${attachment.filename}`}
                onClick={() => removeAttachment(attachment.url)}
              >
                <X className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 3: `SupplierRatingField.tsx`** (new: 5-star clickable input,
  click the active star again to clear)

```tsx
import { Info, Star } from "lucide-react"

import { cn } from "@/lib/utils"

const RATING_MAX = 5
const RATING_STARS = Array.from({ length: RATING_MAX }, (_, i) => i + 1)

type SupplierRatingFieldProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function SupplierRatingField({
  value,
  onChange,
  disabled,
}: SupplierRatingFieldProps) {
  const current = value.length > 0 ? Number(value) : 0

  return (
    <div className="space-y-1.5">
      <span
        className="inline-flex items-center gap-1 text-xs font-medium text-foreground"
        title="Đánh giá mức độ tin cậy của nhà cung cấp, từ 1 đến 5 sao"
      >
        Đánh giá nhà cung cấp
        <Info className="size-3.5 text-muted-foreground" aria-hidden="true" />
      </span>
      <div className="flex items-center gap-1">
        {RATING_STARS.map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            aria-label={`Đánh giá ${star} sao`}
            onClick={() => onChange(star === current ? "" : String(star))}
            className={cn(
              "text-muted-foreground/40 transition-colors hover:text-amber-400 disabled:pointer-events-none disabled:opacity-50",
              star <= current && "text-amber-400"
            )}
          >
            <Star
              className="size-5"
              fill={star <= current ? "currentColor" : "none"}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify** — `pnpm typecheck` and
  `pnpm exec eslint <the 3 new files>` clean.

---

### Task 5: Extend `TextareaField` with a `required` asterisk

**Files:**
- Modify: `src/components/shared/AppFormFields.tsx:66-102` (`TextareaField`)

**Interfaces:** Adds optional `required?: boolean` prop — 100%
backward-compatible (every existing caller omits it, behavior unchanged).

- [ ] **Step 1: Edit** — add `required` to the props type and render the
  same asterisk pattern `TextField` already uses:

```tsx
type TextareaFieldProps = {
  label: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function TextareaField({
  label,
  required,
  placeholder,
  disabled,
  className,
}: TextareaFieldProps) {
  const field = useFieldContext<string>()

  return (
    <Field className={className}>
      <FieldLabel
        htmlFor={field.name}
        className="text-xs font-medium text-foreground"
      >
        {label} {required ? <span className="text-destructive">*</span> : null}
      </FieldLabel>
      <Textarea
        id={field.name}
        name={field.name}
        placeholder={placeholder}
        className="min-h-20 resize-none bg-background text-xs"
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        disabled={disabled}
      />
      <FieldError errors={field.state.meta.errors} />
    </Field>
  )
}
```

- [ ] **Step 2: Verify** — `pnpm typecheck` clean (existing `TextareaField`
  callers in users/products features still compile — the new prop is
  optional).

---

### Task 6: Form sections (Block 1, 2, 3)

**Files:**
- Create: `src/features/suppliers/components/CreateSupplierInfoSection.tsx`
- Create: `src/features/suppliers/components/CreateSupplierPaymentSection.tsx`
- Create: `src/features/suppliers/components/CreateSupplierOtherSection.tsx`

**Interfaces:**
- Consumes: `CREATE_SUPPLIER_DEFAULT_VALUES` (Task 2),
  `SupplierLogoField`/`SupplierAttachmentsField`/`SupplierRatingField`
  (Task 4), `SUPPLIER_TYPE_LABELS`/`PAYMENT_METHOD_LABELS`/
  `PAYMENT_TERM_LABELS`/`SUPPLIER_STATUS_LABELS` (Task 1),
  `buildOptionsFromLabels` (`src/lib/utils.ts`), `withForm`
  (`src/hooks/use-app-form.ts`).
- Produces: `CreateSupplierInfoSection`, `CreateSupplierPaymentSection`,
  `CreateSupplierOtherSection` — all `withForm(...)` components matching
  the `{form, disabled, ...extraProps}` render signature Task 7 composes.

- [ ] **Step 1: `CreateSupplierInfoSection.tsx`** (Block 1 — full-width card,
  fields grid + `SupplierLogoField` aside, same 2-col layout as
  `CreateUserInfoSection`)

```tsx
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { withForm } from "@/hooks/use-app-form"
import { SupplierLogoField } from "@/features/suppliers/components/SupplierLogoField"
import { CREATE_SUPPLIER_DEFAULT_VALUES } from "@/features/suppliers/schemas/create-supplier.schema"
import { SUPPLIER_TYPE_LABELS } from "@/features/suppliers/types/supplier.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type {
  CountryRef,
  SupplierGroupRef,
} from "@/features/suppliers/types/supplier.type"

const SUPPLIER_TYPE_OPTIONS = buildOptionsFromLabels(SUPPLIER_TYPE_LABELS)

export const CreateSupplierInfoSection = withForm({
  defaultValues: CREATE_SUPPLIER_DEFAULT_VALUES,
  props: {
    disabled: false,
    supplierGroupOptions: [] as SupplierGroupRef[],
    countryOptions: [] as CountryRef[],
  },
  render: function Render({
    form,
    disabled,
    supplierGroupOptions,
    countryOptions,
  }) {
    const supplierGroupSelectOptions = supplierGroupOptions.map((option) => ({
      value: option.id,
      label: option.name,
    }))
    const countrySelectOptions = countryOptions.map((option) => ({
      value: option.id,
      label: option.name,
    }))

    return (
      <div className="overflow-hidden rounded-lg bg-card shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            1
          </span>
          <h2 className="font-heading text-base font-semibold text-foreground">
            Thông tin nhà cung cấp
          </h2>
        </div>

        <div className="px-4 pb-5 sm:px-5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto]">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              <Field>
                <FieldLabel className="text-xs font-medium text-foreground">
                  Mã nhà cung cấp <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  readOnly
                  disabled
                  placeholder="Tự động"
                  className="h-9 bg-background text-xs"
                />
              </Field>

              <form.AppField name="name">
                {(field) => (
                  <field.TextField
                    label="Tên nhà cung cấp"
                    required
                    placeholder="Nhập tên nhà cung cấp"
                    disabled={disabled}
                  />
                )}
              </form.AppField>

              <form.AppField name="supplierGroupId">
                {(field) => (
                  <field.SelectField
                    label="Nhóm NCC"
                    required
                    placeholder="Chọn nhóm nhà cung cấp"
                    options={supplierGroupSelectOptions}
                    disabled={disabled}
                  />
                )}
              </form.AppField>

              <form.AppField name="type">
                {(field) => (
                  <field.RadioPillField
                    label="Loại hình nhà cung cấp"
                    required
                    options={SUPPLIER_TYPE_OPTIONS}
                    disabled={disabled}
                  />
                )}
              </form.AppField>

              <form.AppField name="taxCode">
                {(field) => (
                  <field.TextField
                    label="Mã số thuế"
                    required
                    placeholder="Nhập mã số thuế"
                    disabled={disabled}
                  />
                )}
              </form.AppField>

              <form.AppField name="phoneNumber">
                {(field) => (
                  <field.TextField
                    label="Điện thoại"
                    required
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    disabled={disabled}
                  />
                )}
              </form.AppField>

              <form.AppField name="email">
                {(field) => (
                  <field.TextField
                    label="Email"
                    type="email"
                    placeholder="Nhập email"
                    disabled={disabled}
                  />
                )}
              </form.AppField>

              <form.AppField name="representativeName">
                {(field) => (
                  <field.TextField
                    label="Người đại diện"
                    placeholder="Nhập họ và tên người đại diện"
                    disabled={disabled}
                  />
                )}
              </form.AppField>

              <form.AppField name="representativePhone">
                {(field) => (
                  <field.TextField
                    label="Điện thoại người đại diện"
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    disabled={disabled}
                  />
                )}
              </form.AppField>

              <form.AppField name="countryId">
                {(field) => (
                  <field.SelectField
                    label="Quốc gia"
                    placeholder="Chọn quốc gia"
                    options={countrySelectOptions}
                    disabled={disabled}
                  />
                )}
              </form.AppField>

              <form.AppField name="address">
                {(field) => (
                  <field.TextareaField
                    label="Địa chỉ"
                    required
                    placeholder="Nhập địa chỉ chi tiết"
                    disabled={disabled}
                    className="sm:col-span-2"
                  />
                )}
              </form.AppField>

              <form.AppField name="note">
                {(field) => (
                  <field.TextareaField
                    label="Ghi chú"
                    placeholder="Nhập ghi chú thêm về nhà cung cấp"
                    disabled={disabled}
                    className="sm:col-span-2"
                  />
                )}
              </form.AppField>
            </div>

            <form.Field name="logoUrl">
              {(field) => (
                <SupplierLogoField
                  value={field.state.value}
                  onChange={field.handleChange}
                  disabled={disabled}
                />
              )}
            </form.Field>
          </div>
        </div>
      </div>
    )
  },
})
```

- [ ] **Step 2: `CreateSupplierPaymentSection.tsx`** (Block 2 — all fields
  optional, dot-path nested `payment.*` fields, same pattern already proven
  by `UserCredentialSection`'s `credential.*` fields)

```tsx
import { withForm } from "@/hooks/use-app-form"
import { CREATE_SUPPLIER_DEFAULT_VALUES } from "@/features/suppliers/schemas/create-supplier.schema"
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_TERM_LABELS,
} from "@/features/suppliers/types/supplier.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const PAYMENT_METHOD_OPTIONS = buildOptionsFromLabels(PAYMENT_METHOD_LABELS)
const PAYMENT_TERM_OPTIONS = buildOptionsFromLabels(PAYMENT_TERM_LABELS)

export const CreateSupplierPaymentSection = withForm({
  defaultValues: CREATE_SUPPLIER_DEFAULT_VALUES,
  props: {
    disabled: false,
  },
  render: function Render({ form, disabled }) {
    return (
      <div className="overflow-hidden rounded-lg bg-card shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            2
          </span>
          <h2 className="font-heading text-base font-semibold text-foreground">
            Thông tin thanh toán
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 px-4 pb-5 sm:grid-cols-2 sm:px-5">
          <form.AppField name="payment.bankName">
            {(field) => (
              <field.TextField
                label="Tên ngân hàng"
                placeholder="Nhập tên ngân hàng"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="payment.bankAccountNumber">
            {(field) => (
              <field.TextField
                label="Số tài khoản"
                placeholder="Nhập số tài khoản"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="payment.bankAccountHolder">
            {(field) => (
              <field.TextField
                label="Chủ tài khoản"
                placeholder="Nhập chủ tài khoản"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="payment.bankBranch">
            {(field) => (
              <field.TextField
                label="Chi nhánh"
                placeholder="Nhập chi nhánh ngân hàng"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="payment.defaultPaymentMethod">
            {(field) => (
              <field.SelectField
                label="Phương thức thanh toán mặc định"
                placeholder="Chọn phương thức"
                options={PAYMENT_METHOD_OPTIONS}
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="payment.defaultPaymentTerm">
            {(field) => (
              <field.SelectField
                label="Điều khoản thanh toán mặc định"
                placeholder="Chọn điều khoản"
                options={PAYMENT_TERM_OPTIONS}
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="payment.creditLimit">
            {(field) => (
              <field.TextField
                label="Hạn mức công nợ (VND)"
                type="number"
                placeholder="0"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="payment.creditLimitStartDate">
            {(field) => (
              <field.DateField
                label="Ngày bắt đầu áp dụng"
                disabled={disabled}
              />
            )}
          </form.AppField>
        </div>
      </div>
    )
  },
})
```

- [ ] **Step 3: `CreateSupplierOtherSection.tsx`** (Block 3 — rating +
  status + internalNote + attachments)

```tsx
import { withForm } from "@/hooks/use-app-form"
import { SupplierAttachmentsField } from "@/features/suppliers/components/SupplierAttachmentsField"
import { SupplierRatingField } from "@/features/suppliers/components/SupplierRatingField"
import { CREATE_SUPPLIER_DEFAULT_VALUES } from "@/features/suppliers/schemas/create-supplier.schema"
import { SUPPLIER_STATUS_LABELS } from "@/features/suppliers/types/supplier.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const STATUS_OPTIONS = buildOptionsFromLabels(SUPPLIER_STATUS_LABELS)

export const CreateSupplierOtherSection = withForm({
  defaultValues: CREATE_SUPPLIER_DEFAULT_VALUES,
  props: {
    disabled: false,
  },
  render: function Render({ form, disabled }) {
    return (
      <div className="overflow-hidden rounded-lg bg-card shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            3
          </span>
          <h2 className="font-heading text-base font-semibold text-foreground">
            Thông tin khác
          </h2>
        </div>

        <div className="space-y-5 px-4 pb-5 sm:px-5">
          <form.Field name="rating">
            {(field) => (
              <SupplierRatingField
                value={field.state.value}
                onChange={field.handleChange}
                disabled={disabled}
              />
            )}
          </form.Field>

          <form.AppField name="status">
            {(field) => (
              <field.RadioPillField
                label="Trạng thái"
                required
                options={STATUS_OPTIONS}
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="internalNote">
            {(field) => (
              <field.TextareaField
                label="Ghi chú nội bộ"
                placeholder="Nhập ghi chú nội bộ (không hiển thị ra bên ngoài)"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.Field name="attachments">
            {(field) => (
              <SupplierAttachmentsField
                value={field.state.value}
                onChange={field.handleChange}
                disabled={disabled}
              />
            )}
          </form.Field>
        </div>
      </div>
    )
  },
})
```

- [ ] **Step 4: Verify** — `pnpm typecheck` clean. If TanStack Form's
  `withForm` `props` defaults need array types cast (per `CLAUDE.md`: "type
  empty arrays with `[] as X[]`"), confirm `supplierGroupOptions: [] as
  SupplierGroupRef[]` / `countryOptions: [] as CountryRef[]` compile —
  already written that way above.

---

### Task 7: `CreateSupplierForm.tsx` composition

**Files:**
- Create: `src/features/suppliers/components/CreateSupplierForm.tsx`

**Interfaces:**
- Consumes: `CreateSupplierInfoSection`/`CreateSupplierPaymentSection`/
  `CreateSupplierOtherSection` (Task 6), `createSupplierSchema`/
  `CREATE_SUPPLIER_DEFAULT_VALUES`/`CreateSupplierSchema` (Task 2),
  `createSupplier` (Task 3).
- Produces: `CreateSupplierForm({supplierGroupOptions, countryOptions})`.

- [ ] **Step 1: Write the file**

```tsx
import { Activity } from "react"
import { useNavigate, useRouter } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import { AlertOctagon, Loader2, Save } from "lucide-react"

import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { CreateSupplierInfoSection } from "@/features/suppliers/components/CreateSupplierInfoSection"
import { CreateSupplierOtherSection } from "@/features/suppliers/components/CreateSupplierOtherSection"
import { CreateSupplierPaymentSection } from "@/features/suppliers/components/CreateSupplierPaymentSection"
import {
  CREATE_SUPPLIER_DEFAULT_VALUES,
  createSupplierSchema,
} from "@/features/suppliers/schemas/create-supplier.schema"
import { createSupplier } from "@/features/suppliers/server-functions/create-supplier"
import type { CreateSupplierSchema } from "@/features/suppliers/schemas/create-supplier.schema"
import type {
  CountryRef,
  SupplierGroupRef,
} from "@/features/suppliers/types/supplier.type"

type CreateSupplierFormProps = {
  supplierGroupOptions: SupplierGroupRef[]
  countryOptions: CountryRef[]
}

export function CreateSupplierForm({
  supplierGroupOptions,
  countryOptions,
}: CreateSupplierFormProps) {
  const navigate = useNavigate({ from: "/manage/suppliers/create" })
  const router = useRouter()
  const createSupplierFn = useServerFn(createSupplier)

  const createSupplierMutation = useMutation({
    mutationFn: (value: CreateSupplierSchema) =>
      createSupplierFn({ data: value }),
    onSuccess: async () => {
      await router.invalidate()
      await navigate({
        to: "/manage/suppliers",
        search: { page: 1, limit: 10 },
      })
    },
  })

  const isPending = createSupplierMutation.isPending
  const error = createSupplierMutation.error?.message ?? null

  const form = useAppForm({
    defaultValues: CREATE_SUPPLIER_DEFAULT_VALUES,
    validators: {
      onSubmit: createSupplierSchema,
    },
    onSubmit: ({ value }) => createSupplierMutation.mutate(value),
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
      noValidate
      className="space-y-4"
    >
      <Activity mode={error ? "visible" : "hidden"}>
        <Alert className="border-destructive/20 bg-destructive/10 text-destructive">
          <AlertOctagon className="size-4" />
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      </Activity>

      <CreateSupplierInfoSection
        form={form}
        disabled={isPending}
        supplierGroupOptions={supplierGroupOptions}
        countryOptions={countryOptions}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CreateSupplierPaymentSection form={form} disabled={isPending} />
        <CreateSupplierOtherSection form={form} disabled={isPending} />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            void navigate({
              to: "/manage/suppliers",
              search: { page: 1, limit: 10 },
            })
          }
        >
          Hủy
        </Button>
        <Button type="button" variant="outline">
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
                  Lưu nhà cung cấp
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Verify** — `pnpm typecheck` clean.

---

### Task 8: Page + route

**Files:**
- Create: `src/features/suppliers/pages/CreateSupplierPage.tsx`
- Create: `src/routes/(authed)/manage_/suppliers_/create.tsx`

**Interfaces:**
- Consumes: `CreateSupplierForm` (Task 7), `getSupplierGroupFilterOptions`
  (existing), `getCountryFilterOptions` (existing).

- [ ] **Step 1: `CreateSupplierPage.tsx`**

```tsx
import { useLoaderData } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { CreateSupplierForm } from "@/features/suppliers/components/CreateSupplierForm"

export function CreateSupplierPage() {
  const { supplierGroupOptions, countryOptions } = useLoaderData({
    from: "/(authed)/manage_/suppliers_/create",
  })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Thêm nhà cung cấp"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Mua hàng" },
          { label: "Nhà cung cấp", href: "/manage/suppliers" },
          { label: "Thêm nhà cung cấp" },
        ]}
        notificationCount={5}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <CreateSupplierForm
          supplierGroupOptions={supplierGroupOptions}
          countryOptions={countryOptions}
        />
      </div>
    </main>
  )
}
```

- [ ] **Step 2: `src/routes/(authed)/manage_/suppliers_/create.tsx`**

```tsx
import { createFileRoute } from "@tanstack/react-router"

import { CreateSupplierPage } from "@/features/suppliers/pages/CreateSupplierPage"
import { getCountryFilterOptions } from "@/features/suppliers/server-functions/get-countries"
import { getSupplierGroupFilterOptions } from "@/features/suppliers/server-functions/get-supplier-groups"

export const Route = createFileRoute("/(authed)/manage_/suppliers_/create")({
  loader: async () => {
    const [supplierGroupOptions, countryOptions] = await Promise.all([
      getSupplierGroupFilterOptions(),
      getCountryFilterOptions(),
    ])

    return { supplierGroupOptions, countryOptions }
  },
  component: CreateSupplierPage,
})
```

- [ ] **Step 3: Regenerate the route tree** — briefly run `pnpm dev` (or
  build) so the TanStack Start Vite plugin picks up the new route file into
  `src/routeTree.gen.ts` (auto-generated, never hand-edit). Confirm
  `grep -c "suppliers_/create" src/routeTree.gen.ts` is non-zero, then stop
  the dev server.

- [ ] **Step 4: Verify** — `pnpm typecheck` clean (this is the step where
  `useLoaderData({from: "/(authed)/manage_/suppliers_/create"})` and
  `useNavigate({from: "/manage/suppliers/create"})` type-check against the
  regenerated route tree).

---

### Task 9: Wire the list page's "Thêm nhà cung cấp" button

**Files:**
- Modify: `src/features/suppliers/components/SuppliersTableFilter.tsx`

**Interfaces:** No new exports — turns an inert `<Button>` into a real
`<Link>`.

- [ ] **Step 1: Edit** — add the `Link` import and swap the button:

```tsx
import { Link } from "@tanstack/react-router"
```

Replace:
```tsx
<Button type="button" className="text-xs">
  <Plus className="size-4" />
  Thêm nhà cung cấp
</Button>
```
with:
```tsx
<Button asChild className="text-xs">
  <Link to="/manage/suppliers/create">
    <Plus className="size-4" />
    Thêm nhà cung cấp
  </Link>
</Button>
```

- [ ] **Step 2: Verify** — `pnpm typecheck` clean (the `<Link to>` literal
  type-checks against the routeTree generated in Task 8, Step 3).

---

### Task 10: Full verification pass

- [ ] **Step 1: `pnpm typecheck`** — clean across the whole repo.
- [ ] **Step 2: `pnpm exec eslint <every file touched/created above>`** —
  clean. Note top-level `import type` convention (memory:
  `feedback_type_only_imports` — ESLint catches this, `tsc` does not).
- [ ] **Step 3: `pnpm format`** — no diffs expected beyond what was already
  hand-formatted per the codebase's Prettier config.
- [ ] **Step 4: Manual `pnpm dev` walkthrough** (backend already running at
  `localhost:8000`; log in as `superadmin`/`Admin@123`):
  - Navigate `/manage/suppliers` → click **Thêm nhà cung cấp** → lands on
    `/manage/suppliers/create` with all 3 blocks rendered per the mockup.
  - Nhóm NCC / Quốc gia selects list the real seeded options (5 groups, 20
    countries — same as the list page's filters).
  - Fill required fields (Tên, Nhóm NCC, Loại hình, Mã số thuế, Điện thoại,
    Địa chỉ, Trạng thái), submit → `POST /api/suppliers` succeeds → redirect
    to `/manage/suppliers?page=1&limit=10` → the new supplier now appears in
    the (previously empty) table, stat cards increment.
  - Upload a logo (JPG/PNG) → preview renders in the square dropzone.
  - Upload 1-2 attachments (PDF/DOCX) → each appears as a removable row;
    remove one → row disappears, re-submitting doesn't re-include it.
  - Trigger a validation error (submit with required fields empty) → inline
    field errors appear, no request sent.
  - Trigger a tax-code collision (submit twice with the same `taxCode`) →
    Vietnamese error alert "Mã số thuế đã tồn tại." renders, form stays
    filled.
  - No console errors throughout.
- [ ] **Step 5: `git status` / `git diff`** — confirm only the files listed
  in this plan changed, no stray `console.log` or leftover debug code.

---

## Self-review

**Spec coverage:** every mockup field is covered by Tasks 6-8 (block 1: Mã
NCC, Tên, Nhóm NCC, Loại hình, Logo, Mã số thuế, Điện thoại, Email, Người đại
diện, Điện thoại người đại diện, Địa chỉ, Ghi chú, Quốc gia; block 2: all 8
payment fields; block 3: rating, status, internalNote, attachments); footer
buttons (Task 7); real uploads (Task 3-4); list-page wiring (Task 9).

**Placeholder scan:** none — every step has complete, runnable code.

**Type consistency:** `SupplierAttachmentInput` (Task 1) is the type used
consistently by `SupplierAttachmentsField` (Task 4), the schema's
`attachments` field (Task 2), and nowhere else diverges. `UploadedDocument`
(Task 3) is only consumed inside `SupplierAttachmentsField`'s upload
mutation, not exported further. Field/prop names (`supplierGroupOptions`,
`countryOptions`, `disabled`) are identical across Task 6 (definitions) and
Task 7 (composition) and Task 8 (page → form).
