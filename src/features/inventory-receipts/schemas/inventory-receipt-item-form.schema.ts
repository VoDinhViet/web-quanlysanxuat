import { z } from "zod"

import { emptyToUndefined } from "@/lib/zod-transforms"

// One receipt line. Shared as-is by create-inventory-receipt.schema.ts and
// update-inventory-receipt.schema.ts — the backend uses the same
// InventoryReceiptItemReqDto for both POST and PATCH, same idiom as
// orders/schemas/order-item-form.schema.ts.
export const inventoryReceiptItemFormFields = {
  itemId: z.string().trim().min(1, "Vui lòng chọn vật tư"),
  // UI-only — re-displayed in the items table without a second item fetch;
  // dropped by inventoryReceiptItemFormSchema's own transform below before the
  // payload reaches the create/update server function.
  itemLabel: z.string(),
  itemUnit: z.string(),
  // Dòng đơn mua tương ứng — chỉ có khi phiếu chọn chế độ "theo PO".
  purchaseOrderItemId: z.string().trim().transform(emptyToUndefined),
  quantity: z
    .number("Số lượng phải lớn hơn 0")
    .positive("Số lượng phải lớn hơn 0")
    .optional()
    .pipe(z.number("Số lượng phải lớn hơn 0")),
  unitPrice: z
    .number("Đơn giá không được âm")
    .min(0, "Đơn giá không được âm")
    .optional(),
  note: z
    .string()
    .trim()
    .max(500, "Ghi chú tối đa 500 ký tự")
    .transform(emptyToUndefined),
}

// The object-level transform drops itemLabel/itemUnit from the OUTPUT only —
// z.input (below) still sees them, so the row-editing state keeps re-displaying
// the picked item without a second fetch.
export const inventoryReceiptItemFormSchema = z
  .object(inventoryReceiptItemFormFields)
  .transform(({ itemLabel, itemUnit, ...item }) => item)

export type InventoryReceiptItemFormValue = z.input<
  typeof inventoryReceiptItemFormSchema
>

export const inventoryReceiptItemDefaultValue: InventoryReceiptItemFormValue = {
  itemId: "",
  itemLabel: "",
  itemUnit: "",
  purchaseOrderItemId: "",
  quantity: 1,
  unitPrice: undefined,
  note: "",
}
