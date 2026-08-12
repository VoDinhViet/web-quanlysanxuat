import { z } from "zod"

import { IqcResult, IqcStatus } from "@/lib/types/iqc.type"

// Mirrors the backend's GetIqcsReqDto (GET /api/iqc). Every optional field carries
// `.catch(undefined)` so a hand-mangled URL degrades gracefully instead of taking the route down.
// `q` (inherited from PageOptionsDto, searches `iqcInspections.code`) is the "Mã IQC" box — same
// field name as clients-search.schema.ts/users-search.schema.ts use for their own primary code/
// name search box. `order` isn't here: PageOptionsDto accepts it but the service hardcodes
// `orderBy: desc(iqcInspections.createdAt)`, same as supplier-returns-search.schema.ts.
export const iqcSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  materialKeyword: z.string().trim().min(1).optional().catch(undefined),
  supplierId: z.string().trim().min(1).optional().catch(undefined),
  poCode: z.string().trim().min(1).optional().catch(undefined),
  result: z.enum(IqcResult).optional().catch(undefined),
  status: z.enum(IqcStatus).optional().catch(undefined),
})

export type IqcSearchSchema = z.infer<typeof iqcSearchSchema>
