import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { ClientStatus } from "@/lib/types/client.type"
import type { Client } from "@/lib/types/client.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import { optional } from "@/lib/zod-transforms"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetClientsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Broader than the clients feature's route-facing `clientsSearchSchema`
// (page/limit restricted to 10|20|50, `.catch()` defaults for URL parsing,
// which stays local to that route) — this one only needs to stay wire-valid
// for the backend. The cross-domain reference dropdown (materials/products/
// orders) no longer goes through here — it calls the dedicated
// GET /api/clients/options endpoint (get-client-options.api.ts) instead.
const getClientsSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  q: optional(z.string().trim()),
  status: z.enum(ClientStatus).optional(),
  clientGroupId: z.string().trim().min(1).optional(),
})

export const getClients = createServerFn({ method: "GET" })
  .validator(getClientsSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<Client>> => {
    try {
      const response = await http.get<PaginatedResponse<Client>>(
        "/api/clients",
        { params: data }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getClients")

      throw new Error(resolveGetClientsErrorMessage(error))
    }
  })
