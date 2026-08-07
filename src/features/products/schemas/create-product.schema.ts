import { z } from "zod"

import { imageFieldSchema } from "@/lib/file-field.schema"
import { emptyToUndefined } from "@/lib/zod-transforms"
import { ItemStatus, ItemType } from "@/lib/types/item.type"

// Wire contract for POST /api/items — also the client-side onSubmit validator for
// CreateProductForm. `code` is editable (backend allows it, re-checks uniqueness) — leave it
// blank to let the backend generate SPxxxx. Every optional field transforms "" straight to
// undefined here, so the parsed value is already wire-ready — no separate mapping step.
// Deliberately shares no field definitions with update-product.schema.ts: the two flows evolve
// independently. `type` is always FG/WIP here — this feature never creates an RM item.
export const createProductSchema = z.object({
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
  clientId: z.string().trim().transform(emptyToUndefined),
  image: imageFieldSchema,
  status: z.enum(ItemStatus),
  note: z
    .string()
    .trim()
    .max(1000, "Ghi chú tối đa 1000 ký tự")
    .transform(emptyToUndefined),
})

export type CreateProductSchema = z.input<typeof createProductSchema>

export const createProductFormDefaultValues: CreateProductSchema = {
  code: "",
  name: "",
  unitId: "",
  type: ItemType.FG,
  clientId: "",
  image: null,
  status: ItemStatus.ACTIVE,
  note: "",
}
