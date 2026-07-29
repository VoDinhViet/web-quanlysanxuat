import { z } from "zod"

import { fileFieldSchema, imageFieldSchema } from "@/lib/file-field.schema"
import { emptyToUndefined } from "@/lib/zod-transforms"
import { ProductStatus } from "@/lib/types/product.type"

// Wire contract for POST /api/products — also the client-side onSubmit validator for
// CreateProductForm. `code` is editable (backend allows it, re-checks uniqueness) — leave it
// blank to let the backend generate SPxxxx. Every optional field transforms "" straight to
// undefined here, so the parsed value is already wire-ready — no separate mapping step.
// Deliberately shares no field definitions with update-product.schema.ts: the two flows evolve
// independently.
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
  productGroupId: z.string().trim().transform(emptyToUndefined),
  clientId: z.string().trim().transform(emptyToUndefined),
  image: imageFieldSchema,
  attachments: z.array(fileFieldSchema),
  status: z.enum(ProductStatus),
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
  productGroupId: "",
  clientId: "",
  image: null,
  attachments: [],
  status: ProductStatus.ACTIVE,
  note: "",
}
