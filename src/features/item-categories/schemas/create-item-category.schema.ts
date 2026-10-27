import { z } from "zod"

// Wire contract for POST /api/item-categories — also the client-side onSubmit validator for
// CreateItemCategoryForm. Deliberately shares no field definitions with
// update-item-category.schema.ts: the two flows evolve independently.
export const createItemCategorySchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mã nhóm vật tư")
    .max(50, "Mã nhóm vật tư tối đa 50 ký tự"),
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên nhóm vật tư")
    .max(255, "Tên nhóm vật tư tối đa 255 ký tự"),
  description: z.string().trim().max(500, "Mô tả tối đa 500 ký tự"),
})

export type CreateItemCategorySchema = z.input<typeof createItemCategorySchema>

export const createItemCategoryFormDefaultValues: CreateItemCategorySchema = {
  code: "",
  name: "",
  description: "",
}
