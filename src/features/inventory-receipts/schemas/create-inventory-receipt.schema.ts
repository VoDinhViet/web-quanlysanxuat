import { z } from "zod"

import { inventoryReceiptItemFormSchema } from "@/features/inventory-receipts/schemas/inventory-receipt-item-form.schema"
import { emptyToUndefined, toIsoDate } from "@/lib/zod-transforms"

import { InventoryReceiptType } from "@/lib/types/inventory-receipt.type"

// Wire contract for POST /api/inventory-receipts — also the client-side onSubmit
// validator for InventoryReceiptCreateForm. `code` bỏ trống để BE tự sinh
// (PNK-{năm}-xxxxx). Mọi field optional transform ""→undefined, cùng idiom
// create-order.schema.ts. Deliberately shares no field definitions with
// update-inventory-receipt.schema.ts — trên PATCH thiếu key nghĩa là "không đổi",
// nên hai luồng cần transform rỗng khác nhau (undefined ở đây, null ở update).
export const createInventoryReceiptSchema = z.object({
  code: z
    .string()
    .trim()
    .max(50, "Mã tối đa 50 ký tự")
    .transform(emptyToUndefined),
  warehouseId: z.string().trim().min(1, "Vui lòng chọn kho nhận"),
  receiptType: z.enum(InventoryReceiptType),
  receiptDate: z
    .string()
    .min(1, "Vui lòng chọn ngày chứng từ")
    .transform(toIsoDate),
  supplierId: z.string().trim().transform(emptyToUndefined),
  purchaseRequestId: z.string().trim().transform(emptyToUndefined),
  productionOrderId: z.string().trim().transform(emptyToUndefined),
  purchaseOrderId: z.string().trim().transform(emptyToUndefined),
  note: z
    .string()
    .trim()
    .max(1000, "Ghi chú tối đa 1000 ký tự")
    .transform(emptyToUndefined),
  items: z
    .array(inventoryReceiptItemFormSchema)
    .min(1, "Phiếu cần ít nhất một dòng vật tư"),
})

export type CreateInventoryReceiptSchema = z.input<
  typeof createInventoryReceiptSchema
>

export const createInventoryReceiptFormDefaultValues: CreateInventoryReceiptSchema =
  {
    code: "",
    warehouseId: "",
    receiptType: InventoryReceiptType.PURCHASE,
    receiptDate: "",
    supplierId: "",
    purchaseRequestId: "",
    productionOrderId: "",
    purchaseOrderId: "",
    note: "",
    items: [],
  }
