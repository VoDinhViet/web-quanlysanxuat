import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { FILTER_OPTIONS_LIMIT } from "@/lib/constants"
import { http, logHttpError } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { ProductFilterOption } from "@/features/products/types/product.type"

const clientOptionsSearchSchema = z.object({
  q: z.string().trim().optional(),
})

// The full Client type lives in the clients feature, which products must not
// import from (see CLAUDE.md "Features must not import from other features"),
// so the response is narrowed to {id, name} here.
//
// `q` drives the backend's accent-insensitive search so the combobox can look
// up clients server-side rather than pre-loading the first page only.
//
// Deliberate deviation from the throw-on-error rule: the client dropdown is a
// non-core filter/select, so a failed fetch degrades to an empty option list
// instead of taking down the whole products page.
export const getClientOptions = createServerFn({ method: "GET" })
  .validator(clientOptionsSearchSchema)
  .handler(async ({ data }): Promise<ProductFilterOption[]> => {
    try {
      const response = await http.get<PaginatedResponse<ProductFilterOption>>(
        "/api/clients",
        // Omit `q` when empty — the backend requires `q` to be >= 1 char when
        // present (422 otherwise), but an absent `q` returns the first page.
        { params: { q: data.q || undefined, limit: FILTER_OPTIONS_LIMIT } }
      )

      return response.data.data
    } catch (error) {
      logHttpError(error, "getClientOptions")

      return []
    }
  })
