import { z } from "zod"

// Mirrors the backend's GetUnitsReqDto's `q` (units isn't paginated, so no page/limit here).
export const unitsSearchSchema = z.object({
  q: z.string().trim().min(1).optional().catch(undefined),
})

export type UnitsSearchSchema = z.infer<typeof unitsSearchSchema>
