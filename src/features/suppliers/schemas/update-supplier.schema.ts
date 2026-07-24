import { z } from "zod"

import {
  refineSupplierEmail,
  supplierPaymentFields,
  supplierProfileFields,
} from "@/features/suppliers/schemas/supplier-form.schema"

// Wire contract for PATCH /api/suppliers/:id — same profile/payment fields
// as create (supplierProfileFields/supplierPaymentFields already leave every
// value wire-ready), plus the id to route the request.
export const updateSupplierSchema = z
  .object({
    supplierId: z.uuid(),
    ...supplierProfileFields,
    payment: z.object(supplierPaymentFields),
  })
  .superRefine(refineSupplierEmail)

export type UpdateSupplierSchema = z.input<typeof updateSupplierSchema>
