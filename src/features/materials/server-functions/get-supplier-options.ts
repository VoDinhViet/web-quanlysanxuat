import { createServerFn } from "@tanstack/react-start"

import { FILTER_OPTIONS_LIMIT } from "@/lib/constants"
import { http, logHttpError } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { MaterialRef } from "@/features/materials/types/material.type"

// Cross-domain reference (Materials only needs {id, code, name} of a
// preferred supplier) — see the notes in get-client-options.ts, including the
// deliberate degrade-to-[] on failure (`suppliers:read` may be missing from a
// materials-only role, and this dropdown is non-core).
export const getSupplierOptions = createServerFn({ method: "GET" }).handler(
  async (): Promise<MaterialRef[]> => {
    try {
      const response = await http.get<PaginatedResponse<MaterialRef>>(
        "/api/suppliers",
        { params: { limit: FILTER_OPTIONS_LIMIT } }
      )

      return response.data.data
    } catch (error) {
      logHttpError(error, "getSupplierOptions")

      return []
    }
  }
)
