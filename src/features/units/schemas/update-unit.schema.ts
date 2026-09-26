import { z } from "zod"

import { UnitStatus, UnitType } from "@/lib/types/unit.type"

// Wire contract for PATCH /api/units/:unitId — also the client-side onSubmit validator for
// UpdateUnitForm. `unitId` lives directly in the form's own state, so mutationFn receives the
// form value as-is — no manual id merge at the call site. Deliberately shares no field
// definitions with create-unit.schema.ts: the two flows evolve independently.
export const updateUnitSchema = z.object({
  unitId: z.uuid(),
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
  type: z.enum(UnitType),
  status: z.enum(UnitStatus),
})

export type UpdateUnitSchema = z.input<typeof updateUnitSchema>

export const updateUnitFormDefaultValues: UpdateUnitSchema = {
  unitId: "",
  code: "",
  name: "",
  type: UnitType.QUANTITY,
  status: UnitStatus.ACTIVE,
}
