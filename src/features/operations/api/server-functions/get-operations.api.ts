import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import { OperationType } from "@/lib/types/operation.type"
import type { Operation } from "@/lib/types/operation.type"
import { optional } from "@/lib/zod-transforms"

const getOperationsSchema = z.object({
  q: optional(z.string().trim()),
  type: z.enum(OperationType).optional(),
})

// `q` drives the backend's search so the combobox can look up operations
// server-side; `type` narrows it to Inhouse/Outsource only. Only ACTIVE
// operations are offered — a retired one shouldn't be picked for a new
// routing step.
//
// Deliberate deviation from the throw-on-error rule: this dropdown is a
// non-core picker, so a failed fetch degrades to an empty option list instead
// of taking down the whole routing section.
export const getOperations = createServerFn({ method: "GET" })
  .validator(getOperationsSchema)
  .handler(async ({ data }): Promise<Operation[]> => {
    try {
      const response = await http.get<Operation[]>("/api/operations", {
        params: {
          q: data.q,
          type: data.type,
          limit: 100,
          status: "ACTIVE",
        },
      })

      return response.data
    } catch (error) {
      logHttpError(error, "getOperations")

      return []
    }
  })
