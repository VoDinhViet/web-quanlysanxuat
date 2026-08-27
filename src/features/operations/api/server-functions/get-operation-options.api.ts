import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { OperationRef } from "@/lib/types/operation.type"
import { optional } from "@/lib/zod-transforms"

const getOperationOptionsSchema = z.object({
  q: optional(z.string().trim()),
})

// `q` drives the backend's search so the combobox can look up operations
// server-side. Only ACTIVE operations are offered — a retired one shouldn't
// be picked for a new routing step.
//
// Deliberate deviation from the throw-on-error rule: this dropdown is a
// non-core picker, so a failed fetch degrades to an empty option list instead
// of taking down the whole routing section.
export const getOperationOptions = createServerFn({ method: "GET" })
  .validator(getOperationOptionsSchema)
  .handler(async ({ data }): Promise<OperationRef[]> => {
    try {
      const response = await http.get<OperationRef[]>("/api/operations", {
        params: {
          q: data.q,
          limit: 100,
          status: "ACTIVE",
        },
      })

      return response.data
    } catch (error) {
      logHttpError(error, "getOperationOptions")

      return []
    }
  })
