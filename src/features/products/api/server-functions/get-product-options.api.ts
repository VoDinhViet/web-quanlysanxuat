import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ProductRef } from "@/lib/types/product.type"
import { ProductType } from "@/lib/types/product.type"
import { optional } from "@/lib/zod-transforms"

const getProductOptionsSchema = z.object({
  q: optional(z.string().trim()),
  type: z.enum(ProductType).optional(),
})

// Purpose-built dropdown endpoint (GET /api/products/options), distinct from
// getProducts (GET /api/products): the backend always filters ACTIVE, caps at
// 100, and returns a bare array — no `status`/`limit`/`page` param to send, no
// PaginatedResponse envelope to unwrap. Returns only `{id, code, name}`, not
// the full Product shape — see get-client-options.api.ts, same pattern.
//
// Like the other option lists behind a filter control, a failed fetch
// degrades to an empty option list instead of taking down the whole page —
// this dropdown is non-core and callers may lack `products:read`.
export const getProductOptions = createServerFn({ method: "GET" })
  .validator(getProductOptionsSchema)
  .handler(async ({ data }): Promise<ProductRef[]> => {
    try {
      const response = await http.get<ProductRef[]>("/api/products/options", {
        params: { q: data.q, type: data.type },
      })

      return response.data
    } catch (error) {
      logHttpError(error, "getProductOptions")

      return []
    }
  })
