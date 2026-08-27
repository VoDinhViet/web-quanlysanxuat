import { z } from "zod"

import { fileFieldSchema, imageFieldSchema } from "@/lib/file-field.schema"
import { emptyToNull, emptyToUndefined } from "@/lib/zod-transforms"
import { ItemStatus, ItemType } from "@/lib/types/item.type"

// Wire contract for PATCH /api/items/:id — also the client-side onSubmit validator for
// UpdateProductForm (via ProductInfoTab, both driven by ProductDetailPage's own form).
// `itemId` lives directly in the form's own state, so mutationFn receives the form value
// as-is — no manual id merge at the call site. Deliberately shares no field definitions with
// create-product.schema.ts: on a PATCH an omitted key means "leave unchanged", not "not
// provided", so `clientId`/`note` here transform ""→null (an explicit clear) instead of
// ""→undefined — see UpdateItemReqDto's `nullable: true` fields on the backend. `code` stays
// ""→undefined on both flows: the backend treats a missing `code` as "keep the current one",
// not "clear it". `type` is always FG/WIP here — this feature never turns an item into RM.
export const updateProductSchema = z.object({
  itemId: z.uuid(),
  code: z
    .string()
    .trim()
    .max(50, "Mã sản phẩm tối đa 50 ký tự")
    .transform(emptyToUndefined),
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên sản phẩm")
    .max(255, "Tên sản phẩm tối đa 255 ký tự"),
  unitId: z.string().trim().min(1, "Vui lòng chọn đơn vị tính"),
  type: z.enum(ItemType),
  clientId: z.string().trim().transform(emptyToNull),
  image: imageFieldSchema,
  files: z.array(fileFieldSchema),
  status: z.enum(ItemStatus),
  note: z
    .string()
    .trim()
    .max(1000, "Ghi chú tối đa 1000 ký tự")
    .transform(emptyToNull),
})

export type UpdateProductSchema = z.input<typeof updateProductSchema>

// Only used for withForm's type inference in the update flow's own sections — the real values
// always come from ProductDetailPage's own `defaultValues`, so placeholders here are harmless.
export const updateProductFormDefaultValues: UpdateProductSchema = {
  itemId: "",
  code: "",
  name: "",
  unitId: "",
  type: ItemType.FG,
  clientId: "",
  image: null,
  files: [],
  status: ItemStatus.ACTIVE,
  note: "",
}
