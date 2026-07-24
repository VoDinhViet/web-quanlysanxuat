import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { FILTER_OPTIONS_LIMIT } from "@/lib/constants"
import { http, logHttpError } from "@/lib/http"
import type { OperationFilterOption } from "@/features/products/types/operation.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

const operationOptionsSearchSchema = z.object({
  q: z.string().trim().optional(),
  type: z.enum(["INHOUSE", "OUTSOURCE"]).optional(),
})

// `q` drives the backend's search so the combobox can look up operations
// server-side; `type` narrows it to Inhouse/Outsource only. Only ACTIVE
// operations are offered — a retired one shouldn't be picked for a new
// routing step.
//
// Deliberate deviation from the throw-on-error rule: this dropdown is a
// non-core picker, so a failed fetch degrades to an empty option list instead
// of taking down the whole routing section.
export const getOperationOptions = createServerFn({ method: "GET" })
  .validator(operationOptionsSearchSchema)
  .handler(async ({ data }): Promise<OperationFilterOption[]> => {
    try {
      const response = await http.get<PaginatedResponse<OperationFilterOption>>(
        "/api/operations",
        // Omit `q` when empty — mirrors the client-options picker's contract.
        {
          params: {
            q: data.q || undefined,
            type: data.type,
            limit: FILTER_OPTIONS_LIMIT,
            status: "ACTIVE",
          },
        }
      )

      return response.data.data
    } catch (error) {
      logHttpError(error, "getOperationOptions")

      return []
    }
  })
