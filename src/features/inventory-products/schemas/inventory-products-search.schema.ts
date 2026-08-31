import { z } from "zod"

import { isoDateFilter } from "@/lib/zod-transforms"

// Mirrors the subset of GetInventoryProductsReqDto (GET /api/inventory-products) this screen
// sends — the route is already FG-only, no more `itemType` pin needed.
// Bỏ `clientName`/`poCode`/`poCodes` — mock cũ tự nghĩ ra: `InventoryProductResDto` không trả
// `client` và backend không nhận `clientId` (cột `items.client_id` có thật trong DB nhưng endpoint
// tồn kho không chiếu ra); "PO" thì không tồn tại ở đâu cả — `orders` chỉ có `code` nội bộ, và
// dòng tồn kho không liên kết ngược về đơn nào.
// Không có `status` — không còn cột nào hiển thị (backend chỉ dùng để lọc, không trả field). DTO
// vẫn nhận `status` server-side, FE màn này chỉ không gửi. `supplierId` không còn tồn tại trên DTO
// này nữa — chỉ RM (`GetInventoryMaterialsReqDto`) có.
// `asOfDate`: `yyyy-MM-dd`, calendar date picked in "Xem tồn tại ngày". Undefined = tồn hiện tại.
export const inventoryProductsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(20),
  q: z.string().trim().min(1).optional().catch(undefined), // Mã hoặc tên thành phẩm
  asOfDate: isoDateFilter,
})

export type InventoryProductsSearchSchema = z.infer<
  typeof inventoryProductsSearchSchema
>
