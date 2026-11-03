import { z } from "zod"

import { productionOperationProgressStatusOrder } from "@/lib/types/production-job.type"

// Same filter set as production-jobs-search.schema.ts, except `operationStatus` replaces the job
// `status` (the table's status column shows the stage), plus `operationId` — the tile currently
// selected in "CHỌN CÔNG ĐOẠN". Left `.optional()` (not defaulted) on purpose: the page selects
// the first tile client-side once the operations query resolves (see
// ProductionExecutionPage.tsx) rather than baking in a guess here, so the jobs table stays
// `enabled: Boolean(search.operationId)` until then.
// Giá trị `operationId` đặc biệt cho thẻ "Tất cả công đoạn": server function bỏ hẳn tham số này
// để BE trả mọi Job × công đoạn người dùng được phép.
export const ALL_OPERATIONS = "all"

export const OPERATION_SORTS = ["default", "name", "remainingJobCount"] as const

export type OperationSort = (typeof OPERATION_SORTS)[number]

export const productionExecutionSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  operationStatus: z
    .enum(productionOperationProgressStatusOrder)
    .optional()
    .catch(undefined),
  clientId: z.string().trim().min(1).optional().catch(undefined),
  dueDateFrom: z.iso.date().optional().catch(undefined),
  dueDateTo: z.iso.date().optional().catch(undefined),
  operationId: z.string().trim().min(1).optional().catch(undefined),
  operationSort: z.enum(OPERATION_SORTS).optional().catch(undefined),
})

export type ProductionExecutionSearchSchema = z.infer<
  typeof productionExecutionSearchSchema
>

// The subset of search state the "CHỌN CÔNG ĐOẠN" tile row's count depends on — everything
// except pagination, the currently-selected `operationId` itself (a tile counts jobs across
// every operation, not just the selected one) and `operationStatus` (a tile already breaks its
// count down by status, and filtering it would make the selected tile disappear). Both
// ProductionExecutionPage.tsx (building the query key) and
// production-execution-operations.options.ts (typing the factory param) key off this same shape
// so the two can't drift.
export type ProductionExecutionFilters = Pick<
  ProductionExecutionSearchSchema,
  "q" | "clientId" | "dueDateFrom" | "dueDateTo" | "operationSort"
>
