import { z } from "zod"

import { ProductionJobStatus } from "@/lib/types/production-job.type"
import { isoDateFilter } from "@/lib/zod-transforms"

// Same filter set as production-jobs-search.schema.ts, plus `operationId` — the tile currently
// selected in "CHỌN CÔNG ĐOẠN". Left `.optional()` (not defaulted) on purpose: the page selects
// the first tile client-side once the operation-summary query resolves (see
// ProductionExecutionPage.tsx) rather than baking in a guess here, so the jobs table stays
// `enabled: Boolean(search.operationId)` until then.
export const productionExecutionSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(ProductionJobStatus).optional().catch(undefined),
  clientId: z.string().trim().min(1).optional().catch(undefined),
  dueDateFrom: isoDateFilter,
  dueDateTo: isoDateFilter,
  operationId: z.string().trim().min(1).optional().catch(undefined),
})

export type ProductionExecutionSearchSchema = z.infer<
  typeof productionExecutionSearchSchema
>

// The subset of search state the "CHỌN CÔNG ĐOẠN" tile row's count depends on — everything
// except pagination and the currently-selected `operationId` itself (a tile counts jobs across
// every operation, not just the selected one). Both ProductionExecutionPage.tsx (building the
// query key) and production-operation-summary.options.ts (typing the factory param) key off this
// same shape so the two can't drift.
export type ProductionExecutionFilters = Pick<
  ProductionExecutionSearchSchema,
  "q" | "status" | "clientId" | "dueDateFrom" | "dueDateTo"
>
