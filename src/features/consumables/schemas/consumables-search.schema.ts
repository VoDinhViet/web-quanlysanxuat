import { z } from "zod"

import { ItemStatus } from "@/lib/types/item.type"

// Mirrors the backend's GetItemsReqDto (page, limit, q, order inherited from PageOptionsDto;
// clientId/status are the item filters this feature exposes) — `type` isn't part of this schema,
// the server function fixes it to "CONSUMABLE" on every call. No `consumableGroupId` — nhóm hàng hoá was
// dropped when products+consumables merged into `items` (be-quanlysanxuat/docs/decisions/
// items-merge.md), `type` is the only classifier left and this endpoint already fixes it to CONSUMABLE.
export const consumablesSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  clientId: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(ItemStatus).optional().catch(undefined),
  order: z.enum(["ASC", "DESC"]).optional().catch(undefined),
})

export type ConsumablesSearchSchema = z.infer<typeof consumablesSearchSchema>
