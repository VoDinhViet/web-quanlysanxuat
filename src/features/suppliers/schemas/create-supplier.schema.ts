import { z } from "zod"

import { fileFieldSchema, imageFieldSchema } from "@/lib/file-field.schema"
import {
  emptyToUndefined,
  emptyToUndefinedIsoDate,
  optionalEnum,
  refineOptionalEmail,
  refineOptionalPhoneNumber,
} from "@/lib/zod-transforms"

import {
  PaymentMethod,
  PaymentTerm,
  SupplierStatus,
  SupplierType,
} from "@/lib/types/supplier.type"

// Wire contract for POST /api/suppliers — also the client-side onSubmit validator for
// CreateSupplierForm. Every optional field transforms "" straight to undefined here, so the
// parsed value is already wire-ready — no separate mapping step. Deliberately shares no field
// definitions with update-supplier.schema.ts: the two flows evolve independently.
export const createSupplierSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập tên nhà cung cấp")
      .max(255, "Tên nhà cung cấp tối đa 255 ký tự"),
    supplierGroupId: z
      .string()
      .trim()
      .min(1, "Vui lòng chọn nhóm nhà cung cấp"),
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
  .superRefine(refineOptionalPhoneNumber("phoneNumber"))
  .superRefine(refineOptionalPhoneNumber("representativePhone"))

export type CreateSupplierSchema = z.input<typeof createSupplierSchema>

export const createSupplierFormDefaultValues: CreateSupplierSchema = {
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
