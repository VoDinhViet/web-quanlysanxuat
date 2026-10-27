import { z } from "zod"

import { isoDateFilter } from "@/lib/zod-transforms"

// Mirrors the backend's GetInventoryDirectsReqDto (GET /api/inventory-directs). Uses
// `.catch()` on every field so a hand-mangled URL degrades gracefully instead of throwing and
// taking the route down. `itemCategoryId` is the user-managed nhóm vật tư filter. No `order` — the
// backend accepts it but never applies it (always `orderBy(asc(items.code))`), so there is nothing for it to control.
export const inventoryDirectsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  supplierId: z.string().trim().min(1).optional().catch(undefined),
  itemCategoryId: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(["NORMAL", "WARNING", "SHORTAGE"]).optional().catch(undefined),
  // `yyyy-MM-dd`, calendar date picked in the "Xem tồn tại ngày" field. Undefined = current
  // stock. The Asia/Ho_Chi_Minh end-of-day instant is built in
  // get-direct-inventory.api.ts's `.validator()`, not here — this schema only carries the
  // plain calendar date for the picker/URL.
  asOfDate: isoDateFilter,
})

export type InventoryDirectsSearchSchema = z.infer<
  typeof inventoryDirectsSearchSchema
>
