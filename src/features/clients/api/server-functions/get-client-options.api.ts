import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ClientRef } from "@/lib/types/client.type"
import { optional } from "@/lib/zod-transforms"

const getClientOptionsSchema = z.object({
  q: optional(z.string().trim()),
})

// Purpose-built dropdown endpoint (GET /api/clients/options), distinct from
// getClients (GET /api/clients): the backend caps this at its own
// OPTIONS_LIMIT and always returns the whole (capped) catalogue as a bare
// array — no `limit`/`page` param to send, no PaginatedResponse envelope to
// unwrap. Returns only `{id, code, name}`, not the full Client shape.
//
// Like the other option lists behind a filter control, a failed fetch
// degrades to an empty option list instead of taking down the whole page —
// this dropdown is non-core and callers may lack `clients:read` (same
// precedent as get-operation-options.api.ts).
export const getClientOptions = createServerFn({ method: "GET" })
  .validator(getClientOptionsSchema)
  .handler(async ({ data }): Promise<ClientRef[]> => {
    try {
      const response = await http.get<ClientRef[]>("/api/clients/options", {
        params: { q: data.q },
      })

      return response.data
    } catch (error) {
      logHttpError(error, "getClientOptions")

      return []
    }
  })
