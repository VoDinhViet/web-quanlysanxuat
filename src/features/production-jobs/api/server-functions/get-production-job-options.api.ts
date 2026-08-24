import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import { ProductionJobStatus } from "@/lib/types/production-job.type"
import type { ProductionJob } from "@/lib/types/production-job.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import { optional } from "@/lib/zod-transforms"

const getProductionJobOptionsSchema = z.object({
  q: optional(z.string().trim()),
  status: z.enum(ProductionJobStatus).optional(),
})

// `q` drives the backend's search; `status` narrows which Jobs are offered — the outsourcing/
// requisition pickers still pass IN_PROGRESS (a Job that hasn't started has no outsourceable
// operations yet), while the inventory-receipts pickers now omit it entirely (a Job to nhập kho
// thành phẩm may be WAITING_DELIVERY, or already COMPLETED when editing an old draft receipt —
// see be-quanlysanxuat/docs/decisions/production-lifecycle-closing.md).
//
// Deliberate deviation from the throw-on-error rule: this dropdown is a non-core picker, so a
// failed fetch degrades to an empty option list instead of taking down the whole picker section.
export const getProductionJobOptions = createServerFn({ method: "GET" })
  .validator(getProductionJobOptionsSchema)
  .handler(async ({ data }): Promise<ProductionJob[]> => {
    try {
      const response = await http.get<PaginatedResponse<ProductionJob>>(
        "/api/production-jobs",
        {
          params: {
            q: data.q,
            status: data.status,
            limit: 100,
          },
        }
      )

      return response.data.data
    } catch (error) {
      logHttpError(error, "getProductionJobOptions")

      return []
    }
  })
