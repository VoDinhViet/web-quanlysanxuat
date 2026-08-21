import { isValid, parseISO } from "date-fns"
import { z } from "zod"

// Bỏ `category`/`status`/`dateMode`/`fromDate`/`toDate` — bảng Tồn kho thành phẩm
// (InventoryProductsTableColumns.tsx) không có cột Nhóm sản phẩm hay Trạng thái, lọc theo chúng
// làm biến mất dòng mà người dùng không thấy lý do; lọc khoảng ngày trên một màn tồn kho cũng vô
// nghĩa — tồn là ảnh chụp tại một thời điểm, không phải chuỗi sự kiện trong khoảng. Thay bằng một
// `asOfDate` duy nhất, cùng khuôn inventory-materials-search.schema.ts.
export const inventoryProductsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(20),
  q: z.string().trim().min(1).optional().catch(undefined), // Mã hoặc tên thành phẩm
  clientName: z.string().trim().min(1).optional().catch(undefined), // Khách hàng
  poCode: z.string().trim().min(1).optional().catch(undefined), // Số PO
  // `yyyy-MM-dd`, calendar date picked in "Xem tồn tại ngày". Undefined = tồn hiện tại.
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
