import { z } from "zod"

export const inventoryProductsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(20),
  q: z.string().trim().min(1).optional().catch(undefined), // Mã hoặc tên thành phẩm
  clientName: z.string().trim().min(1).optional().catch(undefined), // Khách hàng
  poCode: z.string().trim().min(1).optional().catch(undefined), // Số PO
  dateMode: z.string().trim().min(1).optional().catch(undefined), // Xem theo ngày
  category: z.string().trim().min(1).optional().catch(undefined), // Nhóm sản phẩm
  status: z
    .enum(["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"])
    .optional()
    .catch(undefined), // Trạng thái
  fromDate: z.string().trim().min(1).optional().catch(undefined),
  toDate: z.string().trim().min(1).optional().catch(undefined),
})

export type InventoryProductsSearchSchema = z.infer<
  typeof inventoryProductsSearchSchema
>
