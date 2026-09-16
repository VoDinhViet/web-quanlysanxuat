import { z } from "zod"

import { fileFieldSchema } from "@/lib/file-field.schema"

// Raw form shape for editing a BOM node — `type`/`itemId`/`parentId` bất biến. `code`/`name`
// chỉ sửa được trên node COMPONENT (form chỉ render 2 field này khi `bomItem.type === "COMPONENT"`, xem
// BomItemInfoTab.tsx) — gửi cho node CONSUMABLE sẽ bị backend chặn E271.
// Bỏ trống sortOrder nghĩa là "giữ nguyên thứ tự hiện tại": PATCH thiếu key = không đổi, nên
// `.optional()` (bỏ hẳn key) chứ không phải một giá trị mặc định.
export const updateBomItemSchema = z.object({
  code: z.string().trim().min(1, "Vui lòng nhập mã").optional(),
  name: z.string().trim().min(1, "Vui lòng nhập tên").optional(),
  quantity: z
    .number("Số lượng phải lớn hơn 0")
    .positive("Số lượng phải lớn hơn 0")
    .optional()
    .pipe(z.number("Số lượng phải lớn hơn 0")),
  sortOrder: z
    .number("Thứ tự sắp xếp phải là số nguyên không âm")
    .int("Thứ tự sắp xếp phải là số nguyên không âm")
    .min(0, "Thứ tự sắp xếp phải là số nguyên không âm")
    .optional(),
  note: z.string(),
  drawing: fileFieldSchema.nullable(),
})

export type UpdateBomItemSchema = z.input<typeof updateBomItemSchema>

// Only used for withForm's type inference in BomItemInfoTab — the real values always come from
// BomItemDetailPage's own `defaultValues` (built per node type), so placeholders here are harmless.
export const updateBomItemFormDefaultValues: UpdateBomItemSchema = {
  note: "",
  drawing: null,
}
