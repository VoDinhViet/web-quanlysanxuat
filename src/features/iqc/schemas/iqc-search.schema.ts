import { z } from "zod"

import { paginationSearchFields } from "@/lib/pagination.schema"
import { IqcResult, IqcStatus } from "@/lib/types/iqc.type"

// Mirrors the backend's GetIqcsReqDto (GET /api/iqc). Every optional field carries
// `.catch(undefined)` so a hand-mangled URL degrades gracefully instead of taking the route down.
// `q` (inherited from PageOptionsDto, searches `iqcInspections.code`) is the "Mã IQC" box — same
// field name as clients-search.schema.ts/users-search.schema.ts use for their own primary code/
// name search box. `order` isn't here: PageOptionsDto accepts it but the service hardcodes
// `orderBy: desc(iqcInspections.createdAt)`, same as supplier-returns-search.schema.ts.
// `materialKeyword`/`poCode` removed — backend dropped them (they 500'd `GET /iqc`, a correlated
// `exists()` subquery colliding with the relational query API's own FROM alias).
export const iqcSearchSchema = z.object({
  ...paginationSearchFields(),
  q: z.string().trim().min(1).optional().catch(undefined),
  supplierId: z.string().trim().min(1).optional().catch(undefined),
  result: z.enum(IqcResult).optional().catch(undefined),
  status: z.enum(IqcStatus).optional().catch(undefined),
})

export type IqcSearchSchema = z.infer<typeof iqcSearchSchema>
