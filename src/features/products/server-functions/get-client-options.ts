import { createServerFn } from "@tanstack/react-start"

import { FILTER_OPTIONS_LIMIT } from "@/lib/constants"
import { http, logHttpError } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { ProductFilterOption } from "@/features/products/types/product.type"

// The full Client type lives in the clients feature, which products must not
// import from (see CLAUDE.md "Features must not import from other features"),
// so the response is narrowed to {id, name} here.
//
// Deliberate deviation from the throw-on-error rule: the client dropdown is a
// non-core filter/select, so a failed fetch degrades to an empty option list
// instead of taking down the whole products page.
export const getClientOptions = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProductFilterOption[]> => {
    try {
      const response = await http.get<PaginatedResponse<ProductFilterOption>>(
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
