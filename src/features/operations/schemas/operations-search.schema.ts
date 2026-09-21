import { z } from "zod"

// Mirrors the backend's GetOperationsReqDto's `q` (operations isn't paginated, so no page/limit
// here) — same shape as units-search.schema.ts.
export const operationsSearchSchema = z.object({
  q: z.string().trim().min(1).optional().catch(undefined),
})

export type OperationsSearchSchema = z.infer<typeof operationsSearchSchema>
