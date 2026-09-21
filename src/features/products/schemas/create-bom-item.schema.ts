import { z } from "zod"

import { imageFieldSchema } from "@/lib/file-field.schema"

// Raw shape for adding a BOM item — an item is either a COMPONENT (cấu trúc con, người dùng nhập tay
// code/name) or an CONSUMABLE (vật tư). `type` cố định theo nơi tạo ra nó — CreateComponentItemDialog (từ "+"
// ở ProductBomTable) luôn COMPONENT, dùng đúng nhánh COMPONENT qua `useAppForm`; CreateConsumableDialog (nút
// "Thêm vật tư" ở BomItemConsumablesTable) chọn nhiều vật tư cùng lúc trong ConsumablesPickerTable
// (không qua form đơn lẻ) rồi tự build từng `CreateConsumableItemSchema` — mỗi nơi chỉ dùng đúng một
// nhánh của union này. Empty note → undefined happens in the server function, not here. The
// integer-quantity rule (COMPONENT only) is enforced by the backend and surfaced as a Vietnamese
// message, so it isn't duplicated client-side.
const bomItemCommonSchema = z.object({
  quantity: z
    .number("Số lượng phải lớn hơn 0")
    .positive("Số lượng phải lớn hơn 0")
    .optional()
    .pipe(z.number("Số lượng phải lớn hơn 0")),
  note: z.string(),
})

export const createComponentItemSchema = bomItemCommonSchema.extend({
  type: z.literal("COMPONENT"),
  code: z.string().trim().min(1, "Vui lòng nhập mã"),
  name: z.string().trim().min(1, "Vui lòng nhập tên"),
  // ĐVT riêng của COMPONENT — không bắt buộc (chỉ node này có field này; CONSUMABLE vẫn lấy ĐVT
  // từ item liên kết).
  unitId: z.string().optional(),
  // Ảnh riêng của COMPONENT — cùng phạm vi với `unitId`; server function map sang `imageFileId`.
  image: imageFieldSchema,
})

export const createConsumableItemSchema = bomItemCommonSchema.extend({
  type: z.literal("CONSUMABLE"),
  // Vật tư item này trỏ tới — named apart from the owner scope's own `rootItemId` (added by
  // create-bom-item.api.ts) to avoid colliding with it when the two schemas are merged.
  itemId: z.string().min(1, "Vui lòng chọn vật tư"),
})

export const createBomItemSchema = z.discriminatedUnion("type", [
  createComponentItemSchema,
  createConsumableItemSchema,
])

export type CreateComponentItemSchema = z.input<
  typeof createComponentItemSchema
>
export type CreateConsumableItemSchema = z.input<
  typeof createConsumableItemSchema
>
export type CreateBomItemSchema = z.input<typeof createBomItemSchema>

export const createComponentItemDefaultValues: CreateComponentItemSchema = {
  type: "COMPONENT",
  code: "",
  name: "",
  unitId: undefined,
  image: null,
  quantity: 1,
  note: "",
}
