import { z } from "zod"

import { paginationSearchFields } from "@/lib/pagination.schema"
import { ItemStatus } from "@/lib/types/item.type"

// Mirrors the backend's GetItemsReqDto (page, limit, q, order inherited from PageOptionsDto;
// clientId/status are the item filters this feature exposes) — `type` isn't part of this schema,
// the server function fixes it to "RM" on every call. No `materialGroupId` — nhóm hàng hoá was
// dropped when products+materials merged into `items` (be-quanlysanxuat/docs/decisions/
// items-merge.md), `type` is the only classifier left and this endpoint already fixes it to RM.
export const materialsSearchSchema = z.object({
  ...paginationSearchFields(),
  q: z.string().trim().min(1).optional().catch(undefined),
  clientId: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(ItemStatus).optional().catch(undefined),
  order: z.enum(["ASC", "DESC"]).optional().catch(undefined),
})

export type MaterialsSearchSchema = z.infer<typeof materialsSearchSchema>
