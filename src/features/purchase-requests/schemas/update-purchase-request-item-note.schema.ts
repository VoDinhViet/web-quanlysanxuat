import { z } from "zod"

export const updatePurchaseRequestItemNoteSchema = z.object({
  note: z.string().trim().max(500, "Ghi chú tối đa 500 ký tự"),
})

export type UpdatePurchaseRequestItemNoteSchema = z.infer<
  typeof updatePurchaseRequestItemNoteSchema
>
