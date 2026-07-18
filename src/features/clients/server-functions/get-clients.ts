import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { clientsSearchSchema } from "@/features/clients/schemas/clients-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { Client } from "@/features/clients/types/client.type"

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

export const getClients = createServerFn({ method: "GET" })
  .validator(clientsSearchSchema)
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
