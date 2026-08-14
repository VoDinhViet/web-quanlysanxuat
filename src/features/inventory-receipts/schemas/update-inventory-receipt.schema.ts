import { z } from "zod"

import { inventoryReceiptItemFormSchema } from "@/features/inventory-receipts/schemas/inventory-receipt-item-form.schema"
import { emptyToNull, toIsoDate } from "@/lib/zod-transforms"

import { InventoryReceiptType } from "@/lib/types/inventory-receipt.type"

// Wire contract for PATCH /api/inventory-receipts/:receiptId — chỉ hợp lệ khi phiếu
// còn DRAFT (`E098`). `warehouseId`/`code` bất biến nên không có ở đây. Form luôn hiện
// đủ giá trị hiện tại rồi gửi lại toàn bộ mỗi lần lưu (cùng cách updateOrderSchema làm
// với `items` — "thiếu key = không đổi" chỉ có ý nghĩa ở tầng backend, không phải cách
// form này hoạt động), nên field bắt buộc vẫn bắt buộc ở đây dù DTO backend optional.
export const updateInventoryReceiptSchema = z.object({
  receiptId: z.uuid(),
  receiptType: z.enum(InventoryReceiptType),
  receiptDate: z
    .string()
    .min(1, "Vui lòng chọn ngày chứng từ")
    .transform(toIsoDate),
  supplierId: z.string().trim().transform(emptyToNull),
  purchaseRequestId: z.string().trim().transform(emptyToNull),
  productionOrderId: z.string().trim().transform(emptyToNull),
  purchaseOrderId: z.string().trim().transform(emptyToNull),
  note: z
    .string()
    .trim()
    .max(1000, "Ghi chú tối đa 1000 ký tự")
    .transform(emptyToNull),
  items: z
    .array(inventoryReceiptItemFormSchema)
    .min(1, "Phiếu cần ít nhất một dòng vật tư"),
})

export type UpdateInventoryReceiptSchema = z.input<
  typeof updateInventoryReceiptSchema
>

export const updateInventoryReceiptFormDefaultValues: UpdateInventoryReceiptSchema =
  {
    receiptId: "",
    receiptType: InventoryReceiptType.PURCHASE,
    receiptDate: "",
    supplierId: "",
    purchaseRequestId: "",
    productionOrderId: "",
    purchaseOrderId: "",
    note: "",
    items: [],
  }
