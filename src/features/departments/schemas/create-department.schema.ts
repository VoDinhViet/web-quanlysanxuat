import { z } from "zod"

// Wire contract for POST /api/departments — also the client-side onSubmit validator for
// CreateDepartmentForm. Deliberately shares no field definitions with
// update-department.schema.ts: the two flows evolve independently.
export const createDepartmentSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mã phòng ban")
    .max(50, "Mã phòng ban tối đa 50 ký tự"),
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên phòng ban")
    .max(100, "Tên phòng ban tối đa 100 ký tự"),
})

export type CreateDepartmentSchema = z.input<typeof createDepartmentSchema>

export const createDepartmentFormDefaultValues: CreateDepartmentSchema = {
  code: "",
  name: "",
}
