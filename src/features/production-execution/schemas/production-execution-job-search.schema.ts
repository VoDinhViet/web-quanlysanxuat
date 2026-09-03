import { z } from "zod"

// The công đoạn selected on the list page, carried through the "Xem chi tiết" link — the detail
// page passes this straight through as GET /production-jobs/:jobId/operations?operationId=...,
// which filters server-side down to this one operation. `.optional().catch()` like every other
// search schema in the app — a hand-mangled/missing `operationId` degrades to an empty-state
// message on the page rather than crashing the route.
export const productionExecutionJobSearchSchema = z.object({
  operationId: z.string().trim().min(1).optional().catch(undefined),
})

export type ProductionExecutionJobSearchSchema = z.infer<
  typeof productionExecutionJobSearchSchema
>
