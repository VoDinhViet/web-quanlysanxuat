import { z } from "zod"

import {
  OperationType,
  StructureNodeType,
} from "@/features/products/types/product-structure.type"

// Quantity/minutes come from a text input (see AppFormFields.TextField), so
// the raw form value is a string — this mirrors specificWeight's pattern in
// create-material.schema.ts, but required rather than optional.
function toPositiveNumber(value: string): number {
  return Number(value)
}

export const structureNodeSchema = z.object({
  type: z.enum(StructureNodeType),
  code: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mã")
    .max(50, "Mã tối đa 50 ký tự"),
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên")
    .max(255, "Tên tối đa 255 ký tự"),
  quantity: z
    .string()
    .trim()
    .transform(toPositiveNumber)
    .refine((value) => Number.isFinite(value) && value > 0, {
      message: "Số lượng phải là số lớn hơn 0",
    }),
  unit: z.string().trim().max(20, "ĐVT tối đa 20 ký tự"),
  material: z.string().trim().max(255, "Vật liệu tối đa 255 ký tự"),
})

export type StructureNodeSchema = z.input<typeof structureNodeSchema>

export const STRUCTURE_NODE_DEFAULT_VALUES: StructureNodeSchema = {
  type: StructureNodeType.PART,
  code: "",
  name: "",
  quantity: "1",
  unit: "",
  material: "",
}

export const productOperationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên công đoạn")
    .max(255, "Tên công đoạn tối đa 255 ký tự"),
  resource: z.string().trim().max(100, "Máy/tổ tối đa 100 ký tự"),
  type: z.enum(OperationType),
  minutes: z
    .string()
    .trim()
    .transform(toPositiveNumber)
    .refine((value) => Number.isFinite(value) && value >= 0, {
      message: "Định mức phải là số không âm",
    }),
  note: z.string().trim().max(500, "Ghi chú tối đa 500 ký tự"),
})

export type ProductOperationSchema = z.input<typeof productOperationSchema>

export const PRODUCT_OPERATION_DEFAULT_VALUES: ProductOperationSchema = {
  name: "",
  resource: "",
  type: OperationType.IN_HOUSE,
  minutes: "0",
  note: "",
}
