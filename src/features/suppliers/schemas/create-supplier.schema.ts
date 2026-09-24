import { z } from "zod"

import { fileFieldSchema, imageFieldSchema } from "@/lib/file-field.schema"
import {
  emptyToUndefined,
  emptyToUndefinedIsoDate,
  optionalEnum,
  refineOptionalEmail,
} from "@/lib/zod-transforms"

import {
  PaymentMethod,
  SupplierStatus,
  SupplierType,
} from "@/lib/types/supplier.type"
import { PaymentTerm } from "@/lib/types/payment-term.type"

// Wire contract for POST /api/suppliers — also the client-side onSubmit validator for
// CreateSupplierForm. Every optional field transforms "" straight to undefined here, so the
// parsed value is already wire-ready — no separate mapping step. Deliberately shares no field
// definitions with update-supplier.schema.ts: the two flows evolve independently.
export const createSupplierSchema = z
  .object({
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
    supplierGroupId: z.string().trim().transform(emptyToUndefined),
    type: z.enum(SupplierType),
    taxCode: z
      .string()
      .trim()
      .max(50, "Mã số thuế tối đa 50 ký tự")
      .transform(emptyToUndefined),
    phoneNumber: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || /^\+?\d{8,15}$/.test(value),
        'Số điện thoại không hợp lệ — chỉ nhận chữ số (có thể có dấu "+" ở đầu), 8-15 chữ số.'
      )
      .max(30, "Số điện thoại tối đa 30 ký tự")
      .transform(emptyToUndefined),
    email: z.string().trim().transform(emptyToUndefined),
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
      .transform(emptyToUndefined),
    logo: imageFieldSchema,
    countryId: z.string().trim().transform(emptyToUndefined),
    status: z.enum(SupplierStatus),
    internalNote: z
      .string()
      .trim()
      .max(1000, "Ghi chú nội bộ tối đa 1000 ký tự")
      .transform(emptyToUndefined),
    files: z.array(fileFieldSchema),
    payment: z.object({
      bankName: z.string().trim().transform(emptyToUndefined),
      bankAccountNumber: z.string().trim().transform(emptyToUndefined),
      bankAccountHolder: z.string().trim().transform(emptyToUndefined),
      bankBranch: z.string().trim().transform(emptyToUndefined),
      defaultPaymentMethod: optionalEnum(PaymentMethod),
      defaultPaymentTerm: optionalEnum(PaymentTerm),
      creditLimit: z
        .number("Hạn mức công nợ phải là số nguyên")
        .int("Hạn mức công nợ phải là số nguyên")
        .min(0, "Hạn mức công nợ không được âm")
        .optional(),
      creditLimitStartDate: z
        .string()
        .trim()
        .transform(emptyToUndefinedIsoDate),
    }),
  })
  .superRefine(refineOptionalEmail("email"))

export type CreateSupplierSchema = z.input<typeof createSupplierSchema>

export const createSupplierFormDefaultValues: CreateSupplierSchema = {
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
