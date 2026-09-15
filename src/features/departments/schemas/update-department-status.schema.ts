import { z } from "zod"

// Wire contract for PATCH /api/departments/:departmentId when only the active/inactive toggle
// changes (the list table's inline Switch) — a separate schema from update-department.schema.ts
// so that flow never has to resend the row's `code`/`name`, which would silently clobber a
// rename someone else just made.
export const updateDepartmentStatusSchema = z.object({
  departmentId: z.uuid(),
  isActive: z.boolean(),
})

export type UpdateDepartmentStatusSchema = z.input<
  typeof updateDepartmentStatusSchema
>
