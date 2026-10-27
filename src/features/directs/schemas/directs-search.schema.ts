import { z } from "zod"

import { ItemStatus } from "@/lib/types/item.type"

// Mirrors the backend's GetItemsReqDto (page, limit, q, order inherited from PageOptionsDto;
// clientId/status are the item filters this feature exposes) — `type` isn't part of this schema,
// the server function fixes it to "DIRECT" on every call. `itemCategoryId` is the user-managed
// nhóm vật tư filter.
export const directsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  clientId: z.string().trim().min(1).optional().catch(undefined),
  itemCategoryId: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(ItemStatus).optional().catch(undefined),
  order: z.enum(["ASC", "DESC"]).optional().catch(undefined),
})

export type DirectsSearchSchema = z.infer<typeof directsSearchSchema>
