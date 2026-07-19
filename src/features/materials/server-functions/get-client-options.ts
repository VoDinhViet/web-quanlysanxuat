import { createServerFn } from "@tanstack/react-start"

import { FILTER_OPTIONS_LIMIT } from "@/lib/constants"
import { http, logHttpError } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { MaterialRef } from "@/features/materials/types/material.type"

// Cross-domain reference (Materials only needs {id, code, name} of a client)
// — the full Client type lives in the clients feature, which materials must
// not import from (see CLAUDE.md "Features must not import from other
// features"), so the response is narrowed to MaterialRef here instead.
//
// Deliberate deviation from the throw-on-error rule: GET /api/clients needs
// `clients:read`, which a materials-only role may lack. The client dropdown is
// a non-core filter, so a failed fetch degrades to an empty option list
// instead of taking down the whole materials page.
export const getClientOptions = createServerFn({ method: "GET" }).handler(
  async (): Promise<MaterialRef[]> => {
    try {
      const response = await http.get<PaginatedResponse<MaterialRef>>(
        "/api/clients",
        { params: { limit: FILTER_OPTIONS_LIMIT } }
      )

      return response.data.data
    } catch (error) {
      logHttpError(error, "getClientOptions")

      return []
    }
  }
)
