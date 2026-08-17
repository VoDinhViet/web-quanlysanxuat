import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import { ProductionJobStatus } from "@/lib/types/production-job.type"
import type { ProductionJob } from "@/lib/types/production-job.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import { optional } from "@/lib/zod-transforms"

const getProductionJobOptionsSchema = z.object({
  q: optional(z.string().trim()),
})

// `q` drives the backend's search for the Job filter dropdown. Only IN_PROGRESS jobs are offered —
// a job that hasn't started has no outsourceable operations yet (the outsourceable-operations
// endpoint itself only considers IN_PROGRESS jobs).
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
            status: ProductionJobStatus.IN_PROGRESS,
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
