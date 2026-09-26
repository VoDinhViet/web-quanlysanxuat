import { z } from "zod"

import { OperationStatus } from "@/lib/types/operation.type"

// Mirrors the backend's GetOperationsReqDto's `q`/`status` (operations isn't paginated, so
// no page/limit here).
export const operationsSearchSchema = z.object({
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(OperationStatus).optional().catch(undefined),
})

export type OperationsSearchSchema = z.infer<typeof operationsSearchSchema>
