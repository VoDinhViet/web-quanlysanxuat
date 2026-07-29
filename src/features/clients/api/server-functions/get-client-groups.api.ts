import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ClientGroupRef } from "@/lib/types/client.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetClientGroupsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getClientGroups = createServerFn({ method: "GET" }).handler(
  async (): Promise<ClientGroupRef[]> => {
    try {
      const response = await http.get<PaginatedResponse<ClientGroupRef>>(
        "/api/client-groups",
        { params: { limit: 100 } }
      )

      return response.data.data
    } catch (error) {
      logHttpError(error, "getClientGroups")

      throw new Error(resolveGetClientGroupsErrorMessage(error))
    }
  }
)
