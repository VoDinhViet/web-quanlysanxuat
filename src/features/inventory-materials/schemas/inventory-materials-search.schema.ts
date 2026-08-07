import { DateTime } from "luxon"
import { z } from "zod"

// Mirrors the backend's GetMaterialInventoryReqDto (GET /api/inventory/materials). Uses
// `.catch()` on every field so a hand-mangled URL degrades gracefully instead of throwing and
// taking the route down. No `materialGroupId`/`materialTypeId` — the backend dropped "nhóm hàng
// hoá"/"loại vật tư" as concepts when products+materials merged into `items` (`type` is the only
// classifier left, and this endpoint already fixes it to RM). No `order` — the backend accepts it
// but never applies it (always `orderBy(asc(items.code))`), so there is nothing for it to control.
export const inventoryMaterialsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  supplierId: z.string().trim().min(1).optional().catch(undefined),
  warehouseId: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(["NORMAL", "WARNING", "SHORTAGE"]).optional().catch(undefined),
  // `yyyy-MM-dd`, calendar date picked in the "Xem tồn tại ngày" field. Undefined = current
  // stock. The Asia/Ho_Chi_Minh end-of-day instant is built in
  // get-material-inventory.api.ts's `.validator()`, not here — this schema only carries the
  // plain calendar date for the picker/URL. Same `isoDateFilter` shape as
  // purchase-requests-search.schema.ts.
  asOfDate: z
    .string()
    .refine((value) => DateTime.fromISO(value).isValid, {
      message: "Ngày không hợp lệ",
    })
    .optional()
    .catch(undefined),
})

export type InventoryMaterialsSearchSchema = z.infer<
  typeof inventoryMaterialsSearchSchema
>
