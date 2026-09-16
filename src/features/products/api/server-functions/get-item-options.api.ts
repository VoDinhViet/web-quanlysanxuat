import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ItemRef } from "@/lib/types/item.type"
import { optional } from "@/lib/zod-transforms"

// `type` also accepts "CONSUMABLE" here (unlike ItemType, which is FG-only) — dùng bởi các picker
// FG/CONSUMABLE khác nhau (đơn hàng, phiếu nhập kho), không phải BOM.
const getItemOptionsSchema = z.object({
  q: optional(z.string().trim()),
  type: z.enum(["FG", "CONSUMABLE"]).optional(),
})

// Purpose-built dropdown endpoint (GET /api/items/options), distinct from
// getItems (GET /api/items): the backend always filters ACTIVE, caps at
// 100, and returns a bare array — no `status`/`limit`/`page` param to send, no
// PaginatedResponse envelope to unwrap. Returns only `{id, code, name}`, not
// the full Item shape — see get-client-options.api.ts, same pattern.
//
// Like the other option lists behind a filter control, a failed fetch
// degrades to an empty option list instead of taking down the whole page —
// this dropdown is non-core and callers may lack `items:read`.
export const getItemOptions = createServerFn({ method: "GET" })
  .validator(getItemOptionsSchema)
  .handler(async ({ data }): Promise<ItemRef[]> => {
    try {
      const response = await http.get<ItemRef[]>("/api/items/options", {
        params: { q: data.q, type: data.type },
      })

      return response.data
    } catch (error) {
      logHttpError(error, "getItemOptions")

      return []
    }
  })
