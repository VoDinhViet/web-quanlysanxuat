import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ClientContact } from "@/lib/types/client.type"

const getClientContactsSchema = z.object({
  clientId: z.string().trim().min(1),
})

// Single consumer (OrderContactSelect.tsx) — lives here rather than
// src/lib/server-functions/ or src/features/clients/ (orders can't import
// another feature's server functions). GET /api/clients/:clientId/
// contacts is a dedicated endpoint returning just the contacts, so picking a
// client doesn't need its whole detail record.
//
// Like the other option lists behind a filter control, a failed fetch
// degrades to an empty list instead of taking down the whole create/update
// order form — this picker is a non-core convenience, not a bound form field
// (see OrderContactSelect's own comment).
export const getClientContacts = createServerFn({ method: "GET" })
  .validator(getClientContactsSchema)
  .handler(async ({ data }): Promise<ClientContact[]> => {
    try {
      const response = await http.get<ClientContact[]>(
        `/api/clients/${data.clientId}/contacts`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getClientContacts")

      return []
    }
  })
