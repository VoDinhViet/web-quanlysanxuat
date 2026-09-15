import { z } from "zod"

// Wire contract for PATCH /api/departments/:departmentId — also the client-side onSubmit
// validator for UpdateDepartmentForm. `departmentId` lives directly in the form's own state, so
// mutationFn receives the form value as-is — no manual id merge at the call site. Deliberately
// shares no field definitions with create-department.schema.ts: the two flows evolve
// independently.
export const updateDepartmentSchema = z.object({
  departmentId: z.uuid(),
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
  isActive: z.boolean().optional(),
})

export type UpdateDepartmentSchema = z.input<typeof updateDepartmentSchema>
