import { z } from "zod"

import { PRODUCT_STATUSES } from "@/features/products/types/product.type"

// A blank form input means "not provided" — the wire payload should omit the
// field rather than send an empty string (the backend then auto-generates the
// code / defaults the revision).
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
  revision: z
    .string()
    .trim()
    .max(50, "Rev tối đa 50 ký tự")
    .transform(emptyToUndefined),
  imageUrl: z.string().trim().transform(emptyToUndefined),
  status: z.enum(PRODUCT_STATUSES),
  note: z
    .string()
    .trim()
    .max(1000, "Ghi chú tối đa 1000 ký tự")
    .transform(emptyToUndefined),
}

export const createProductSchema = z.object(productProfileFields)

export type CreateProductSchema = z.input<typeof createProductSchema>

export const CREATE_PRODUCT_DEFAULT_VALUES: CreateProductSchema = {
  code: "",
  name: "",
  unitId: "",
  productGroupId: "",
  clientId: "",
  revision: "",
  imageUrl: "",
  status: "ACTIVE",
  note: "",
}
