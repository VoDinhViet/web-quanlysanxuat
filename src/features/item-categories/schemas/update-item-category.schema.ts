import { z } from "zod"

// Wire contract for PATCH /api/item-categories/:itemCategoryId — also the client-side onSubmit
// validator for UpdateItemCategoryForm. `itemCategoryId` lives in the form's own state, so
// mutationFn receives the form value as-is. Deliberately shares no field definitions with
// create-item-category.schema.ts: the two flows evolve independently.
export const updateItemCategorySchema = z.object({
  itemCategoryId: z.uuid(),
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

export type UpdateItemCategorySchema = z.input<typeof updateItemCategorySchema>
