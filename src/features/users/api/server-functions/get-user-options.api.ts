import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { UserRef } from "@/lib/types/user.type"
import { optional } from "@/lib/zod-transforms"

const getUserOptionsSchema = z.object({
  q: optional(z.string().trim()),
})

// Dedicated dropdown endpoint (đang làm việc only, capped at 100, search theo code/tên) — not
// paginated. No `users:*` permission required, unlike GET /users. Mirror get-client-options.api.ts:
// a failed fetch degrades to an empty option list instead of taking down the whole page.
export const getUserOptions = createServerFn({ method: "GET" })
  .validator(getUserOptionsSchema)
  .handler(async ({ data }): Promise<UserRef[]> => {
    try {
      const response = await http.get<UserRef[]>("/api/users/options", {
        params: { q: data.q },
      })

      return response.data
    } catch (error) {
      logHttpError(error, "getUserOptions")

      return []
    }
  })
