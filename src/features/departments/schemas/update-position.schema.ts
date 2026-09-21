import { z } from "zod"

// Wire contract for PATCH /api/positions/:positionId — also the client-side onSubmit validator
// for UpdatePositionForm. `positionId`/`departmentId` live directly in the form's own state, so
// mutationFn receives the form value as-is — no manual id merge at the call site. `departmentId`
// isn't user-editable here (see create-position.schema.ts) — moving a position to another
// department isn't a flow this dialog offers. Deliberately shares no field definitions with
// create-position.schema.ts: the two flows evolve independently.
export const updatePositionSchema = z.object({
  positionId: z.uuid(),
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

export type UpdatePositionSchema = z.input<typeof updatePositionSchema>
