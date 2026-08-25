import { z } from "zod"

// Wire contract for POST /api/units — also the client-side onSubmit validator for
// CreateUnitForm. Deliberately shares no field definitions with update-unit.schema.ts: the two
// flows evolve independently.
export const createUnitSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mã đơn vị tính")
    .max(50, "Mã đơn vị tính tối đa 50 ký tự"),
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên đơn vị tính")
    .max(100, "Tên đơn vị tính tối đa 100 ký tự"),
  scopes: z
    .array(z.enum(["MATERIAL", "PRODUCT"]))
    .min(1, "Vui lòng chọn ít nhất một phạm vi sử dụng"),
})

export type CreateUnitSchema = z.input<typeof createUnitSchema>

export const createUnitFormDefaultValues: CreateUnitSchema = {
  code: "",
  name: "",
  scopes: [],
}
