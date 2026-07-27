import { z } from "zod"

import {
  refineSupplierEmail,
  supplierPaymentFields,
  supplierProfileFields,
} from "@/features/suppliers/schemas/supplier-form.schema"

// Wire contract for POST /api/suppliers — same profile/payment fields as
// supplierFormSchema (supplierProfileFields/supplierPaymentFields already
// leave every value wire-ready).
export const createSupplierSchema = z
  .object({
    ...supplierProfileFields,
    payment: z.object(supplierPaymentFields),
  })
  .superRefine(refineSupplierEmail)

export type CreateSupplierSchema = z.input<typeof createSupplierSchema>
