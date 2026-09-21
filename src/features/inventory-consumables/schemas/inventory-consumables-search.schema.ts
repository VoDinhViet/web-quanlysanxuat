import { z } from "zod"

import { isoDateFilter } from "@/lib/zod-transforms"

// Mirrors the backend's GetInventoryConsumablesReqDto (GET /api/inventory-consumables). Uses
// `.catch()` on every field so a hand-mangled URL degrades gracefully instead of throwing and
// taking the route down. No `consumableGroupId`/`consumableTypeId` — the backend dropped "nhóm hàng
// hoá"/"loại vật tư" as concepts when products+consumables merged into `items` (`type` is the only
// classifier left, and this endpoint already fixes it to CONSUMABLE). No `order` — the backend accepts it
// but never applies it (always `orderBy(asc(items.code))`), so there is nothing for it to control.
export const inventoryConsumablesSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  supplierId: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(["NORMAL", "WARNING", "SHORTAGE"]).optional().catch(undefined),
  // `yyyy-MM-dd`, calendar date picked in the "Xem tồn tại ngày" field. Undefined = current
  // stock. The Asia/Ho_Chi_Minh end-of-day instant is built in
  // get-consumable-inventory.api.ts's `.validator()`, not here — this schema only carries the
  // plain calendar date for the picker/URL.
  asOfDate: isoDateFilter,
})

export type InventoryConsumablesSearchSchema = z.infer<
  typeof inventoryConsumablesSearchSchema
>
