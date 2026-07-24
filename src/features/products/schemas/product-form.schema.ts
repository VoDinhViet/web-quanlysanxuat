import { z } from "zod"

import { fileFieldSchema, imageFieldSchema } from "@/lib/file-field.schema"
import { ProductStatus } from "@/features/products/types/product.type"

// A blank form input means "not provided" — the wire payload should omit the
// field rather than send an empty string (the backend then auto-generates the
// code).
function emptyToUndefined(value: string): string | undefined {
  return value.length > 0 ? value : undefined
}

// Wire contract for POST /api/products. `code` is editable (backend allows it,
// re-checks uniqueness) — leave it blank to let the backend generate SPxxxx.
export const productProfileFields = {
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
}

export const productFormSchema = z.object(productProfileFields)

export type ProductFormSchema = z.input<typeof productFormSchema>

export const PRODUCT_FORM_DEFAULT_VALUES: ProductFormSchema = {
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
