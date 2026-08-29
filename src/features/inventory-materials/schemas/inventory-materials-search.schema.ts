import { z } from "zod"

import { paginationSearchFields } from "@/lib/pagination.schema"
import { isoDateFilter } from "@/lib/zod-transforms"

// Mirrors the backend's GetInventoryMaterialsReqDto (GET /api/inventory-materials). Uses
// `.catch()` on every field so a hand-mangled URL degrades gracefully instead of throwing and
// taking the route down. No `materialGroupId`/`materialTypeId` — the backend dropped "nhóm hàng
// hoá"/"loại vật tư" as concepts when products+materials merged into `items` (`type` is the only
// classifier left, and this endpoint already fixes it to RM). No `order` — the backend accepts it
// but never applies it (always `orderBy(asc(items.code))`), so there is nothing for it to control.
// No `warehouseId` either — the table has no "Kho" column, so filtering by it would match rows
// with no visible reason (the DTO still accepts it server-side, this frontend just stopped
// sending it).
export const inventoryMaterialsSearchSchema = z.object({
  ...paginationSearchFields(),
  q: z.string().trim().min(1).optional().catch(undefined),
  supplierId: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(["NORMAL", "WARNING", "SHORTAGE"]).optional().catch(undefined),
  // `yyyy-MM-dd`, calendar date picked in the "Xem tồn tại ngày" field. Undefined = current
  // stock. The Asia/Ho_Chi_Minh end-of-day instant is built in
  // get-material-inventory.api.ts's `.validator()`, not here — this schema only carries the
  // plain calendar date for the picker/URL.
  asOfDate: isoDateFilter,
})

export type InventoryMaterialsSearchSchema = z.infer<
  typeof inventoryMaterialsSearchSchema
>
