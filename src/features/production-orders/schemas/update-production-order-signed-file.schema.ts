import { z } from "zod"

export const updateProductionOrderSignedFileSchema = z.object({
  productionOrderId: z.string().trim().min(1, "Mã LSX không được để trống"),
  signedFileId: z.string().trim().nullable(),
})

export type UpdateProductionOrderSignedFileSchema = z.infer<
  typeof updateProductionOrderSignedFileSchema
>
