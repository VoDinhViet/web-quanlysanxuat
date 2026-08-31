import { z } from "zod"

import { inventoryAdjustmentItemFormSchema } from "@/features/inventory-adjustments/schemas/inventory-adjustment-item-form.schema"
import { emptyToNull, toIsoDate } from "@/lib/zod-transforms"

import {
  InventoryAdjustmentReason,
  InventoryAdjustmentType,
} from "@/lib/types/inventory-adjustment.type"

// Wire contract for PATCH /api/inventory-adjustments/:adjustmentId — chỉ hợp lệ khi phiếu
// còn DRAFT (`E098`). `code` bất biến nên không có ở đây. Form luôn hiện đủ giá trị hiện tại
// rồi gửi lại toàn bộ mỗi lần lưu (cùng cách update-inventory-receipt.schema.ts làm), nên
// field bắt buộc vẫn bắt buộc ở đây dù DTO backend optional.
export const updateInventoryAdjustmentSchema = z.object({
  adjustmentId: z.uuid(),
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
    .transform(emptyToNull),
  items: z
    .array(inventoryAdjustmentItemFormSchema)
    .min(1, "Phiếu cần ít nhất một dòng vật tư"),
})

export type UpdateInventoryAdjustmentSchema = z.input<
  typeof updateInventoryAdjustmentSchema
>

export const updateInventoryAdjustmentFormDefaultValues: UpdateInventoryAdjustmentSchema =
  {
    adjustmentId: "",
    adjustmentType: InventoryAdjustmentType.INCREASE,
    reason: InventoryAdjustmentReason.STOCKTAKE,
    adjustmentDate: "",
    note: "",
    items: [],
  }
