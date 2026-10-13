import { z } from "zod"

import { NcrStatus, NcrType } from "@/lib/types/ncr.type"

// Mirrors the backend's GetNcrsReqDto (GET /api/ncrs); every optional field carries
// `.catch(undefined)` so a hand-mangled URL degrades gracefully. `q` searches the NCR code.
export const ncrsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(NcrStatus).optional().catch(undefined),
  type: z.enum(NcrType).optional().catch(undefined),
  departmentId: z.uuid().optional().catch(undefined),
  clientId: z.uuid().optional().catch(undefined),
})

export type NcrsSearchSchema = z.infer<typeof ncrsSearchSchema>
