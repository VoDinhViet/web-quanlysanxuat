import { z } from "zod"

import { inventoryAdjustmentItemFormSchema } from "@/features/inventory-adjustments/schemas/inventory-adjustment-item-form.schema"
import { emptyToUndefined, toIsoDate } from "@/lib/zod-transforms"

import {
  InventoryAdjustmentReason,
  InventoryAdjustmentType,
} from "@/lib/types/inventory-adjustment.type"

// Wire contract for POST /api/inventory-adjustments — also the client-side onSubmit
// validator for InventoryAdjustmentCreateForm. Phiếu luôn tạo ở trạng thái DRAFT (BE tự
// set, không có field status ở đây). Deliberately shares no field definitions with
// update-inventory-adjustment.schema.ts — cùng lý do create-inventory-receipt.schema.ts nêu.
export const createInventoryAdjustmentSchema = z.object({
  adjustmentType: z.enum(InventoryAdjustmentType),
  reason: z.enum(InventoryAdjustmentReason),
  adjustmentDate: z
    .string()
    .min(1, "Vui lòng chọn ngày điều chỉnh")
    .transform(toIsoDate),
  note: z
    .string()
    .trim()
    .max(1000, "Ghi chú tối đa 1000 ký tự")
    .transform(emptyToUndefined),
  items: z
    .array(inventoryAdjustmentItemFormSchema)
    .min(1, "Phiếu cần ít nhất một dòng vật tư"),
})

export type CreateInventoryAdjustmentSchema = z.input<
  typeof createInventoryAdjustmentSchema
>

export const createInventoryAdjustmentFormDefaultValues: CreateInventoryAdjustmentSchema =
  {
    adjustmentType: InventoryAdjustmentType.INCREASE,
    reason: InventoryAdjustmentReason.STOCKTAKE,
    adjustmentDate: "",
    note: "",
    items: [],
  }
