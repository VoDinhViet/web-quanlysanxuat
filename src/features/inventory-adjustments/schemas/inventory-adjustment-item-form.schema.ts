import { z } from "zod"

import { emptyToUndefined } from "@/lib/zod-transforms"

// One adjustment line. Shared as-is by create-inventory-adjustment.schema.ts and
// update-inventory-adjustment.schema.ts — the backend uses the same
// InventoryAdjustmentItemReqDto for both POST and PATCH, same idiom as
// inventory-receipts/schemas/inventory-receipt-item-form.schema.ts. No `unitId` — chưa dựng UI
// chọn đơn vị phụ đợt này (xem plan Phần C), BE tự default đơn vị gốc khi thiếu key.
export const inventoryAdjustmentItemFormFields = {
  itemId: z.string().trim().min(1, "Vui lòng chọn vật tư"),
  // UI-only — re-displayed in the items table without a second item fetch; dropped by
  // inventoryAdjustmentItemFormSchema's own transform below before the payload reaches the
  // create/update server function.
  itemLabel: z.string(),
  itemUnit: z.string(),
  quantity: z
    .number("Số lượng phải lớn hơn 0")
    .positive("Số lượng phải lớn hơn 0")
    .optional()
    .pipe(z.number("Số lượng phải lớn hơn 0")),
  note: z
    .string()
    .trim()
    .max(500, "Ghi chú tối đa 500 ký tự")
    .transform(emptyToUndefined),
}

export const inventoryAdjustmentItemFormSchema = z
  .object(inventoryAdjustmentItemFormFields)
  .transform(({ itemLabel, itemUnit, ...item }) => item)

export type InventoryAdjustmentItemFormValue = z.input<
  typeof inventoryAdjustmentItemFormSchema
>

export const inventoryAdjustmentItemDefaultValue: InventoryAdjustmentItemFormValue =
  {
    itemId: "",
    itemLabel: "",
    itemUnit: "",
    quantity: 1,
    note: "",
  }
