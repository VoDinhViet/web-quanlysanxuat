import { z } from "zod"

// Search param cho /manage/inventory-receipts/create-receipt — chọn làn nào trong 2 làn tạo
// phiếu nhập (Từ PO / Khách hàng) đang hiện. `.catch("po")` cho default cụ thể, đúng khuôn
// product-detail-search.schema.ts — không phải `.optional()`: "active tab" là shareable state,
// luôn cần một giá trị thật để Tabs' `value` bind vào, không phải `string | undefined`.
export const inventoryReceiptCreateLaneSchema = z.enum(["po", "return"])

export type InventoryReceiptCreateLane = z.infer<
  typeof inventoryReceiptCreateLaneSchema
>

export const createInventoryReceiptLaneSearchSchema = z.object({
  lane: inventoryReceiptCreateLaneSchema.catch("po"),
})

export type CreateInventoryReceiptLaneSearchSchema = z.infer<
  typeof createInventoryReceiptLaneSearchSchema
>
