import { z } from "zod"

import { fileFieldSchema } from "@/lib/file-field.schema"

// Raw form shape for editing a BOM node — identity/parent are immutable, only
// quantity / sort order / note / drawing change. Bỏ trống sortOrder nghĩa là
// "giữ nguyên thứ tự hiện tại": PATCH thiếu key = không đổi, nên `.optional()`
// (bỏ hẳn key) chứ không phải một giá trị mặc định.
export const updateBomItemSchema = z.object({
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
