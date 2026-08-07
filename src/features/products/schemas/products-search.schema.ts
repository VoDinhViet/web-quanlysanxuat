import { z } from "zod"

import { ItemStatus, ItemType } from "@/lib/types/item.type"

// Mirrors the backend's GetItemsReqDto (page, limit, q, order inherited from
// PageOptionsDto; type/status/clientId are item filters this feature exposes). An unset `type`
// means "all products" (FG + WIP) — get-items.api.ts translates that into the backend's
// `type` array filter so RM never leaks into this list.
export const productsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  type: z.enum(ItemType).optional().catch(undefined),
  status: z.enum(ItemStatus).optional().catch(undefined),
  clientId: z.string().trim().min(1).optional().catch(undefined),
  order: z.enum(["ASC", "DESC"]).optional().catch(undefined),
})

export type ProductsSearchSchema = z.infer<typeof productsSearchSchema>
