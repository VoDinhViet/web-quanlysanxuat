import { z } from "zod"

import { UnitStatus, UnitType } from "@/lib/types/unit.type"

// Wire contract for POST /api/units — also the client-side onSubmit validator for
// CreateUnitForm. `code` is user-entered (the backend 409s on a duplicate). Deliberately
// shares no field definitions with update-unit.schema.ts: the two flows evolve independently.
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
  type: z.enum(UnitType),
  status: z.enum(UnitStatus),
})

export type CreateUnitSchema = z.input<typeof createUnitSchema>

export const createUnitFormDefaultValues: CreateUnitSchema = {
  code: "",
  name: "",
  type: UnitType.QUANTITY,
  status: UnitStatus.ACTIVE,
}
