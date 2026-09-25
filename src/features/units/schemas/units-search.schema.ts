import { z } from "zod"

import { UnitStatus, UnitType } from "@/lib/types/unit.type"

// Mirrors the backend's GetUnitsReqDto (`q`/`type`/`status`). `/units` returns the whole
// catalogue (a few dozen rows), so pagination is local to UnitsTable, not a search param.
export const unitsSearchSchema = z.object({
  q: z.string().trim().min(1).optional().catch(undefined),
  type: z.enum(UnitType).optional().catch(undefined),
  status: z.enum(UnitStatus).optional().catch(undefined),
})

export type UnitsSearchSchema = z.infer<typeof unitsSearchSchema>
