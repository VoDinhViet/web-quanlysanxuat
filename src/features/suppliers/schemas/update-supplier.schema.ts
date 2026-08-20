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
  PaymentTerm,
  SupplierStatus,
  SupplierType,
} from "@/lib/types/supplier.type"

// Wire contract for PATCH /api/suppliers/:id — also the client-side onSubmit validator for
// UpdateSupplierForm. `supplierId` lives directly in the form's own state (the update flow's
// sections are its own components, not shared with CreateSupplierForm, so there's no
// withForm-invariance conflict), so mutationFn receives the form value as-is — no manual id
// merge at the call site. Deliberately shares no field definitions with
// create-supplier.schema.ts: on a PATCH an omitted key means "leave unchanged", not "not
// provided", so every optional field here transforms ""→null (an explicit clear) instead of
// ""→undefined — see UpdateSupplierReqDto's `nullable: true` fields on the backend.
// `taxCode`/`phoneNumber`/`address` stay required on both flows, so they carry no null variant.
export const updateSupplierSchema = z.object({
  supplierId: z.uuid(),
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
  // optionalEmail() transforms ""→undefined; a PATCH needs an explicit null to actually clear
  // the field (an omitted key means "leave unchanged"), so re-map the last step.
  email: optionalEmail().transform((value) => value ?? null),
  // Not part of UpdateSupplierReqDto directly — the server function's own
  // buildRepresentativesPayload folds these into `representatives[]`, which is already
  // replace-all regardless of undefined vs null.
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
    .transform(emptyToNull),
  logo: imageFieldSchema,
  countryId: z.string().trim().transform(emptyToNull),
  status: z.enum(SupplierStatus),
  internalNote: z
    .string()
    .trim()
    .max(1000, "Ghi chú nội bộ tối đa 1000 ký tự")
    .transform(emptyToNull),
  attachments: z.array(fileFieldSchema),
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
  attachments: [],
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
