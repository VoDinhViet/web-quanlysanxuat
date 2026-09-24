import { z } from "zod"

import { fileFieldSchema, imageFieldSchema } from "@/lib/file-field.schema"
import {
  emptyToNull,
  emptyToUndefined,
  optionalEmail,
  optionalEnumNullable,
  toIsoDate,
} from "@/lib/zod-transforms"

import {
  PaymentMethod,
  SupplierStatus,
  SupplierType,
} from "@/lib/types/supplier.type"
import { PaymentTerm } from "@/lib/types/payment-term.type"

// Wire contract for PATCH /api/suppliers/:id — also the client-side onSubmit validator for
// UpdateSupplierForm. `supplierId` lives directly in the form's own state (the update flow's
// sections are its own components, not shared with CreateSupplierForm, so there's no
// withForm-invariance conflict), so mutationFn receives the form value as-is — no manual id
// merge at the call site. Deliberately shares no field definitions with
// create-supplier.schema.ts: on a PATCH an omitted key means "leave unchanged", not "not
// provided", so every optional field here transforms ""→null (an explicit clear) instead of
// ""→undefined — see UpdateSupplierReqDto's `nullable: true` fields on the backend.
// `supplierGroupId`/`taxCode`/`phoneNumber` are optional on both flows; on PATCH an emptied box
// sends an explicit null to clear it. `address` stays required.
export const updateSupplierSchema = z.object({
  supplierId: z.uuid(),
  code: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mã nhà cung cấp")
    .max(50, "Mã nhà cung cấp tối đa 50 ký tự"),
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên nhà cung cấp")
    .max(255, "Tên nhà cung cấp tối đa 255 ký tự"),
  supplierGroupId: z.string().trim().transform(emptyToNull),
  type: z.enum(SupplierType),
  taxCode: z
    .string()
    .trim()
    .max(50, "Mã số thuế tối đa 50 ký tự")
    .transform(emptyToNull),
  phoneNumber: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\+?\d{8,15}$/.test(value),
      'Số điện thoại không hợp lệ — chỉ nhận chữ số (có thể có dấu "+" ở đầu), 8-15 chữ số.'
    )
    .max(30, "Số điện thoại tối đa 30 ký tự")
    .transform(emptyToNull),
  // optionalEmail() transforms ""→undefined; a PATCH needs an explicit null to actually clear
  // the field (an omitted key means "leave unchanged"), so re-map the last step.
  email: optionalEmail().transform((value) => value ?? null),
  // Not part of UpdateSupplierReqDto directly — the server function's own
  // buildRepresentativesPayload folds these into `representatives[]`, which is already
  // replace-all regardless of undefined vs null.
  representativeName: z.string().trim().transform(emptyToUndefined),
  representativePhone: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\+?\d{8,15}$/.test(value),
      'Số điện thoại không hợp lệ — chỉ nhận chữ số (có thể có dấu "+" ở đầu), 8-15 chữ số.'
    )
    .transform(emptyToUndefined),
  address: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập địa chỉ")
    .max(500, "Địa chỉ tối đa 500 ký tự"),
  note: z
    .string()
    .trim()
    .max(1000, "Ghi chú tối đa 1000 ký tự")
    .transform(emptyToNull),
  logo: imageFieldSchema,
  countryId: z.string().trim().transform(emptyToNull),
  status: z.enum(SupplierStatus),
  internalNote: z
    .string()
    .trim()
    .max(1000, "Ghi chú nội bộ tối đa 1000 ký tự")
    .transform(emptyToNull),
  files: z.array(fileFieldSchema),
  payment: z.object({
    bankName: z.string().trim().transform(emptyToNull),
    bankAccountNumber: z.string().trim().transform(emptyToNull),
    bankAccountHolder: z.string().trim().transform(emptyToNull),
    bankBranch: z.string().trim().transform(emptyToNull),
    defaultPaymentMethod: optionalEnumNullable(PaymentMethod),
    defaultPaymentTerm: optionalEnumNullable(PaymentTerm),
    creditLimit: z
      .number("Hạn mức công nợ phải là số nguyên")
      .int("Hạn mức công nợ phải là số nguyên")
      .min(0, "Hạn mức công nợ không được âm")
      .optional()
      .transform((value) => value ?? null),
    creditLimitStartDate: z
      .string()
      .trim()
      .transform((value) => (value.length > 0 ? toIsoDate(value) : null)),
  }),
})

export type UpdateSupplierSchema = z.input<typeof updateSupplierSchema>

// Only used for withForm's type inference in the update flow's own sections — the real values
// always come from UpdateSupplierForm's own `defaultValues`, so placeholders here are harmless.
export const updateSupplierFormDefaultValues: UpdateSupplierSchema = {
  supplierId: "",
  code: "",
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
  logo: null,
  countryId: "",
  status: SupplierStatus.ACTIVE,
  internalNote: "",
  files: [],
  payment: {
    bankName: "",
    bankAccountNumber: "",
    bankAccountHolder: "",
    bankBranch: "",
    defaultPaymentMethod: "",
    defaultPaymentTerm: "",
    creditLimit: undefined,
    creditLimitStartDate: "",
  },
}
