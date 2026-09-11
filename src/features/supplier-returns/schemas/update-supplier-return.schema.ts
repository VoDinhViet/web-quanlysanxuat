import { z } from "zod"

export const updateSupplierReturnSchema = z.object({
  supplierReturnId: z.string().uuid(),
  returnReason: z.string().max(1000, "Lý do trả hàng tối đa 1000 ký tự.").nullable().optional(),
})

export type UpdateSupplierReturnInput = z.infer<typeof updateSupplierReturnSchema>
