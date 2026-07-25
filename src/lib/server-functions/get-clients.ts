import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { ClientStatus } from "@/lib/types/client.type"
import type { Client } from "@/lib/types/client.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

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

// Broader than any single caller's own search schema on purpose: the clients
// feature's route-facing `clientsSearchSchema` (page/limit restricted to
// 10|20|50, `.catch()` defaults for URL parsing) stays local to that route —
// this schema only needs to stay wire-valid for the backend, since callers
// range from the clients list page (full paginated filters) to a cross-domain
// reference dropdown in materials/products (just `q` + a larger `limit`).
const getClientsSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  q: z.string().trim().min(1).optional(),
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
