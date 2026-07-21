import { z } from "zod"

const createProductRevisionFields = {
  revisionNo: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mã revision")
    .max(20, "Mã revision tối đa 20 ký tự"),
  sourceRevisionId: z.string().trim().min(1, "Vui lòng chọn bản sao chép từ"),
  note: z.string().trim(),
  setAsCurrent: z.boolean(),
}

export const createProductRevisionSchema = z.object(createProductRevisionFields)

export type CreateProductRevisionSchema = z.infer<
  typeof createProductRevisionSchema
>

export const CREATE_PRODUCT_REVISION_DEFAULT_VALUES: CreateProductRevisionSchema =
  {
    revisionNo: "",
    sourceRevisionId: "",
    note: "",
    setAsCurrent: true,
  }
