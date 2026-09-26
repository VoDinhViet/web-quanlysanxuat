import { z } from "zod"

import { OperationStatus } from "@/lib/types/operation.type"

// Mirrors the backend's GetOperationsReqDto (page, limit, q inherited from PageOptionsDto;
// status is operation-specific). `q` searches the operation name.
export const operationsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(OperationStatus).optional().catch(undefined),
})

export type OperationsSearchSchema = z.infer<typeof operationsSearchSchema>
