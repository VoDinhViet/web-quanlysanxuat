import {
  createInventoryReceiptFormDefaultValues,
  createInventoryReceiptSchema,
} from "@/features/inventory-receipts/schemas/create-inventory-receipt.schema"
import type { CreateInventoryReceiptSchema } from "@/features/inventory-receipts/schemas/create-inventory-receipt.schema"
import { InventoryReceiptType } from "@/lib/types/inventory-receipt.type"

// Validator cho làn "Nhập từ khác" (?lane=other trên route create-receipt) — dùng lại nguyên
// createInventoryReceiptSchema, chỉ refine thêm bắt buộc `reason` (BE trả E293 nếu thiếu). `refine`
// (không `.extend()`) giữ nguyên z.input y hệt CreateInventoryReceiptSchema để
// CreateInventoryReceiptGenericItemsSection (withForm khoá cứng theo type đó) tái dùng thẳng.
export const createInventoryReceiptOtherSchema =
  createInventoryReceiptSchema.refine((value) => Boolean(value.reason), {
    message: "Vui lòng nhập lý do nhập kho",
    path: ["reason"],
  })

// receiptType cố định OTHER, requiresIqc khởi tạo false — annotate kiểu tường minh (cùng lý do
// create-inventory-receipt-return.schema.ts).
export const createInventoryReceiptOtherFormDefaultValues: CreateInventoryReceiptSchema =
  {
    ...createInventoryReceiptFormDefaultValues,
    receiptType: InventoryReceiptType.OTHER,
    requiresIqc: false,
  }
