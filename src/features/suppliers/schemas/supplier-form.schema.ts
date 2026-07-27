import { z } from "zod"

import { fileFieldSchema, imageFieldSchema } from "@/lib/file-field.schema"
import {
  emptyToUndefined,
  emptyToUndefinedIsoDate,
  emptyToUndefinedNumber,
} from "@/lib/zod-transforms"

import {
  PaymentMethod,
  PaymentTerm,
  SupplierStatus,
  SupplierType,
} from "@/lib/types/supplier.type"

// Wire contract for POST /api/suppliers' `payment` field — matches the
// backend's nested payment DTO. Always sent (the form always shows this
// block), every sub-field individually optional.
export const supplierPaymentFields = {
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
    .refine((value) => value === undefined || Number.isInteger(value), {
      message: "Hạn mức công nợ phải là số nguyên",
    })
    .refine((value) => value === undefined || value >= 0, {
      message: "Hạn mức công nợ không được âm",
    }),
  creditLimitStartDate: z.string().trim().transform(emptyToUndefinedIsoDate),
}

const createSupplierPaymentSchema = z.object(supplierPaymentFields)

// The company email is optional, so it only needs a format check when filled
// (email is already transformed to undefined-when-empty by supplierProfileFields
// by the time this runs).
export function refineSupplierEmail(
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

export const supplierProfileFields = {
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
  logo: imageFieldSchema,
  countryId: z.string().trim().transform(emptyToUndefined),
  status: z.enum(SupplierStatus),
  internalNote: z
    .string()
    .trim()
    .max(1000, "Ghi chú nội bộ tối đa 1000 ký tự")
    .transform(emptyToUndefined),
  attachments: z.array(fileFieldSchema),
}

export const supplierFormSchema = z
  .object({
    ...supplierProfileFields,
    payment: createSupplierPaymentSchema,
  })
  .superRefine(refineSupplierEmail)

export type SupplierFormSchema = z.input<typeof supplierFormSchema>

export type SupplierRepresentativePayload = {
  name: string
  phoneNumber?: string
  isPrimary: boolean
}

// The form only exposes one flat representative (name + phone) — mapped here
// to the backend's `representatives[]` shape, shared by both create and
// update server functions. An empty name means "no representative", mapped
// to `[]` rather than omitted: the backend replaces the full representatives
// list on both create (no-op on an empty array) and update (clears any
// existing representative instead of leaving it untouched).
export function buildRepresentativesPayload(
  name?: string,
  phoneNumber?: string
): SupplierRepresentativePayload[] {
  return name ? [{ name, phoneNumber, isPrimary: true }] : []
}

export const SUPPLIER_FORM_DEFAULT_VALUES: SupplierFormSchema = {
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
    creditLimit: "",
    creditLimitStartDate: "",
  },
}
