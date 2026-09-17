import { z } from "zod"

import { imageFieldSchema } from "@/lib/file-field.schema"

// Raw form shape for editing a BOM node — `type`/`itemId`/`parentId` bất biến. `code`/`name`/`unitId`
// chỉ sửa được trên node COMPONENT (form chỉ render các field này khi `bomItem.type === "COMPONENT"`, xem
// BomItemInfoTab.tsx) — gửi cho node CONSUMABLE/ROOT sẽ bị backend chặn E271.
// Bỏ trống sortOrder nghĩa là "giữ nguyên thứ tự hiện tại": PATCH thiếu key = không đổi, nên
// `.optional()` (bỏ hẳn key) chứ không phải một giá trị mặc định.
export const updateBomItemSchema = z.object({
  code: z.string().trim().min(1, "Vui lòng nhập mã").optional(),
  name: z.string().trim().min(1, "Vui lòng nhập tên").optional(),
  // Bỏ trống = giữ nguyên; null xoá ĐVT đã gán — không giới hạn theo unit scope.
  unitId: z.string().nullable().optional(),
  // Thiếu key = giữ nguyên (node không phải COMPONENT không đưa key này vào defaultValues); null xoá
  // ảnh đã gán. Server function map sang `imageFileId`.
  image: imageFieldSchema.optional(),
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
})

export type UpdateBomItemSchema = z.input<typeof updateBomItemSchema>

// Only used for withForm's type inference in BomItemInfoTab — the real values always come from
// BomItemDetailPage's own `defaultValues` (built per node type), so placeholders here are harmless.
export const updateBomItemFormDefaultValues: UpdateBomItemSchema = {
  note: "",
}
