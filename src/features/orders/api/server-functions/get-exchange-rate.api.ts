import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { logHttpError } from "@/lib/http"
import { Currency } from "@/lib/types/order.type"

const EXCHANGE_RATE_API_URL = "https://open.er-api.com/v6/latest"

const getExchangeRateSchema = z.object({
  currency: z.enum(Currency),
})

// Free/keyless tier of exchangerate-api.com (rates refresh ~once/day). Only
// ever called for a non-VND currency — VND's own rate is fixed at 1
// client-side. Not called through the shared `http` client: that instance is
// baseURL-scoped to the internal backend and attaches the session's
// Authorization header + cookies (src/lib/http.ts) — reusing it here would
// leak both to a third-party host. Degrades to `null` on failure like the
// app's other non-core reference lookups (see get-operations.api.ts) — the
// field stays editable either way.
export const getExchangeRate = createServerFn({ method: "GET" })
  .validator(getExchangeRateSchema)
  .handler(async ({ data }): Promise<number | null> => {
    try {
      const response = await axios.get<{
        rates: Record<string, number | undefined>
      }>(`${EXCHANGE_RATE_API_URL}/${data.currency}`)
      return response.data.rates.VND ?? null
    } catch (error) {
      logHttpError(error, "getExchangeRate")
      return null
    }
  })
