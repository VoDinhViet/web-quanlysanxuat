import { z } from "zod"

import { IqcResult } from "@/lib/types/iqc.type"
import { OqcDisposition, OqcStatus } from "@/lib/types/oqc.type"

// Mirrors the backend's GetOqcsReqDto (GET /api/oqc). Every optional field carries
// `.catch(undefined)` so a hand-mangled URL degrades gracefully instead of taking the route down.
// `q` (inherited from PageOptionsDto, searches `oqc_inspections.code`) is the "Mã OQC" box, same
// idiom as iqc-search.schema.ts. `productionJobId` isn't here — filtering by a specific Job needs
// a picker this round doesn't build (list+detail+actions only). `itemId` IS here, but not for a
// picker on this screen's own filter bar — it's used programmatically by the finished-goods
// inventory detail screen's "QC PASS gần nhất" card (InventoryProductRecentActivityCards.tsx),
// which calls `oqcsQueryOptions({itemId, result: IqcResult.PASS, limit: 10, ...})` (only the
// first row is used) through this feature's `api/index.ts` barrel.
export const oqcSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  itemId: z.uuid().optional().catch(undefined),
  result: z.enum(IqcResult).optional().catch(undefined),
  status: z.enum(OqcStatus).optional().catch(undefined),
  disposition: z.enum(OqcDisposition).optional().catch(undefined),
  startDate: z.string().trim().min(1).optional().catch(undefined),
  endDate: z.string().trim().min(1).optional().catch(undefined),
})

export type OqcSearchSchema = z.infer<typeof oqcSearchSchema>
