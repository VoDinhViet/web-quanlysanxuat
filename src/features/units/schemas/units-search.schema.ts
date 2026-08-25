import { z } from "zod"

// Mirrors the backend's GetUnitsReqDto's `q`/`scope` (units isn't paginated, so no page/limit
// here).
export const unitsSearchSchema = z.object({
  q: z.string().trim().min(1).optional().catch(undefined),
  scope: z.enum(["MATERIAL", "PRODUCT"]).optional().catch(undefined),
})

export type UnitsSearchSchema = z.infer<typeof unitsSearchSchema>
