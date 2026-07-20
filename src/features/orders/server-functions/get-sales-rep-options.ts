import { createServerFn } from "@tanstack/react-start"

import { FILTER_OPTIONS_LIMIT } from "@/lib/constants"
import { http, logHttpError } from "@/lib/http"
import type { OrderFilterOption } from "@/features/orders/types/order.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

// A dedicated endpoint readable with `orders:read`, rather than reusing
// /api/users — that would require the viewer to hold `users:*`, which a sales
// manager plausibly doesn't, silently emptying the filter.
//
// Like the other option lists behind a filter control, a failed fetch degrades
// to an empty list instead of taking down the page.
export const getSalesRepOptions = createServerFn({ method: "GET" }).handler(
  async (): Promise<OrderFilterOption[]> => {
    try {
      const response = await http.get<PaginatedResponse<OrderFilterOption>>(
        "/api/orders/sales-rep-options",
        { params: { limit: FILTER_OPTIONS_LIMIT } }
      )

      return response.data.data
    } catch (error) {
      logHttpError(error, "getSalesRepOptions")

      return []
    }
  }
)
