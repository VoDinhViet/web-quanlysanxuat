import { z } from "zod"

// Mirrors the backend's GetItemCategoriesReqDto (`q`). `/item-categories` returns the whole
// catalogue, so pagination is local to ItemCategoriesTable, not a search param.
export const itemCategoriesSearchSchema = z.object({
  q: z.string().trim().min(1).optional().catch(undefined),
})

export type ItemCategoriesSearchSchema = z.infer<
  typeof itemCategoriesSearchSchema
>
