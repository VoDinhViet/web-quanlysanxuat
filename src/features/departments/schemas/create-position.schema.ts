import { z } from "zod"

// Wire contract for POST /api/positions — also the client-side onSubmit validator for
// CreatePositionForm. `departmentId` is fixed by the department detail page the form is opened
// from (not a user-editable field), so it isn't rendered — only carried through to the payload.
// Deliberately shares no field definitions with update-position.schema.ts: the two flows evolve
// independently.
export const createPositionSchema = z.object({
  departmentId: z.uuid(),
  code: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mã chức vụ")
    .max(50, "Mã chức vụ tối đa 50 ký tự"),
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên chức vụ")
    .max(100, "Tên chức vụ tối đa 100 ký tự"),
})

export type CreatePositionSchema = z.input<typeof createPositionSchema>

export const createPositionFormDefaultValues = (
  departmentId: string
): CreatePositionSchema => ({
  departmentId,
  code: "",
  name: "",
})
