import { isValid, parseISO } from "date-fns"
import { z } from "zod"

// Mirrors the subset of GetInventoryReqDto (GET /api/inventory) this screen sends; the call is
// pinned to itemType=FG in get-product-inventory.api.ts.
// Bỏ `clientName`/`poCode`/`poCodes` — mock cũ tự nghĩ ra: `InventoryItemResDto` không trả
// `client` và `GetInventoryReqDto` không nhận `clientId` (cột `items.client_id` có thật trong DB
// nhưng endpoint tồn kho không chiếu ra); "PO" thì không tồn tại ở đâu cả — `orders` chỉ có `code`
// nội bộ, và dòng tồn kho không liên kết ngược về đơn nào.
// Không có `supplierId`/`status`/`warehouseId` — NCC chỉ có ý nghĩa với RM (luôn null trên FG),
// trạng thái không có cột nào hiển thị, và bảng không có cột Kho. DTO vẫn nhận các tham số này
// server-side, FE màn này chỉ không gửi.
// `asOfDate`: `yyyy-MM-dd`, calendar date picked in "Xem tồn tại ngày". Undefined = tồn hiện tại.
export const inventoryProductsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(20),
  q: z.string().trim().min(1).optional().catch(undefined), // Mã hoặc tên thành phẩm
  asOfDate: z
    .string()
    .refine((value) => isValid(parseISO(value)), {
      message: "Ngày không hợp lệ",
    })
    .optional()
    .catch(undefined),
})

export type InventoryProductsSearchSchema = z.infer<
  typeof inventoryProductsSearchSchema
>
