import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ProductRef } from "@/lib/types/product.type"
import { optional } from "@/lib/zod-transforms"

// `type` also accepts "RM" here (unlike ProductType, which is FG/WIP-only) — this options
// endpoint backs the "add BOM item" picker (use-get-bom-product-options.ts), which needs to
// look up either a WIP sub-assembly or an RM material to add as a tree node.
const getProductOptionsSchema = z.object({
  q: optional(z.string().trim()),
  type: z.enum(["FG", "WIP", "RM"]).optional(),
})

// Purpose-built dropdown endpoint (GET /api/items/options), distinct from
// getProducts (GET /api/items): the backend always filters ACTIVE, caps at
// 100, and returns a bare array — no `status`/`limit`/`page` param to send, no
// PaginatedResponse envelope to unwrap. Returns only `{id, code, name}`, not
// the full Product shape — see get-client-options.api.ts, same pattern.
//
// Like the other option lists behind a filter control, a failed fetch
// degrades to an empty option list instead of taking down the whole page —
// this dropdown is non-core and callers may lack `items:read`.
export const getProductOptions = createServerFn({ method: "GET" })
  .validator(getProductOptionsSchema)
  .handler(async ({ data }): Promise<ProductRef[]> => {
    try {
      const response = await http.get<ProductRef[]>("/api/items/options", {
        params: { q: data.q, type: data.type },
      })

      return response.data
    } catch (error) {
      logHttpError(error, "getProductOptions")

      return []
    }
  })
