import { z } from "zod"

import { isPositiveNumberString } from "@/lib/zod-transforms"

// Bước ③ của wizard "Nhập kho từ PO" — một dòng cho mỗi dòng PO đã chọn ở bước ②. itemLabel/
// itemUnit/requestedQuantity là UI-only (hiển thị lại không cần fetch lần 2, cùng idiom
// inventory-receipt-item-form.schema.ts). Cố ý không có `unitPrice` — ảnh mẫu không cho sửa đơn
// giá ở luồng này; submit lấy thẳng unitPrice từ dòng PO gốc (xem
// InventoryReceiptCreateFromPoForm.tsx's buildCreateInventoryReceiptPayload).
const inventoryReceiptFromPoItemFields = {
  purchaseOrderItemId: z.string().trim().min(1),
  itemId: z.string().trim().min(1),
  itemLabel: z.string(),
  itemUnit: z.string(),
  requestedQuantity: z.number(),
  quantity: z
    .string()
    .trim()
    .refine(isPositiveNumberString, "Số lượng nhận phải lớn hơn 0"),
  note: z.string().trim().max(500, "Ghi chú tối đa 500 ký tự"),
}

// SL nhận lần này không được vượt SL đặt — cùng ràng buộc backend tự kiểm lại ở confirm
// (`ensureReceiptQuantitiesWithinOrdered`), chặn ngay ở form thay vì để round-trip lên server
// rồi báo lỗi.
export const inventoryReceiptFromPoItemSchema = z
  .object(inventoryReceiptFromPoItemFields)
  .refine((item) => Number(item.quantity) <= item.requestedQuantity, {
    message: "SL nhận lần này không được lớn hơn SL đặt",
    path: ["quantity"],
  })
export type InventoryReceiptFromPoItemValue = z.input<
  typeof inventoryReceiptFromPoItemSchema
>

// Toàn bộ form 4 bước — `purchaseOrderId` (bước ①), `requiresIqc` (bước ③, dạng "no"/"yes" để
// khớp RadioPillField<TValue extends string>, đổi sang boolean thật khi build payload thật gửi
// server function), `items` (bước ③). Cố ý không có warehouseId/supplierId/receiptDate/
// receiptType — wizard tự suy ra từ PO đã chọn lúc submit (kho nhận + NCC của PO, ngày = hôm
// nay, loại phiếu luôn PURCHASE), không có ô nhập tay nào cho chúng trong 4 bước.
export const createInventoryReceiptFromPoFormSchema = z.object({
  purchaseOrderId: z.string().trim().min(1, "Vui lòng chọn PO cần nhập"),
  requiresIqc: z.enum(["no", "yes"]),
  items: z
    .array(inventoryReceiptFromPoItemSchema)
    .min(1, "Cần ít nhất một dòng vật tư"),
})

export type CreateInventoryReceiptFromPoFormSchema = z.input<
  typeof createInventoryReceiptFromPoFormSchema
>

export const createInventoryReceiptFromPoFormDefaultValues: CreateInventoryReceiptFromPoFormSchema =
  {
    purchaseOrderId: "",
    requiresIqc: "no",
    items: [],
  }
