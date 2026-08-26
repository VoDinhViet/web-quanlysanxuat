import { z } from "zod"

// The công đoạn selected on the list page, carried through the "Xem chi tiết" link — the detail
// page's Part table filters GET /production-jobs/:jobId/operations down to this one operation
// (see C1 trong kế hoạch: BE trả mọi công đoạn của mỗi part, FE tự lọc). `.optional().catch()`
// like every other search schema in the app — a hand-mangled/missing `operationId` degrades to
// an empty-state message on the page rather than crashing the route.
export const productionExecutionJobSearchSchema = z.object({
  operationId: z.string().trim().min(1).optional().catch(undefined),
})

export type ProductionExecutionJobSearchSchema = z.infer<
  typeof productionExecutionJobSearchSchema
>
