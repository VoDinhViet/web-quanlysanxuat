import { z } from "zod"

// Raw form shape for editing a BOM node — identity/parent are immutable, only
// quantity / sort order / note change. `sortOrder` is a text input (empty =
// leave unchanged); wire mapping to numbers happens in the server function.
export const updateBomItemSchema = z.object({
  quantity: z.string().refine((value) => {
    const parsed = Number(value)
    return value.trim() !== "" && Number.isFinite(parsed) && parsed > 0
  }, "Số lượng phải lớn hơn 0"),
  sortOrder: z.string(),
  note: z.string(),
})

export type UpdateBomItemSchema = z.infer<typeof updateBomItemSchema>
