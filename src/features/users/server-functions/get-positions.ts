import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { FILTER_OPTIONS_LIMIT } from "@/lib/constants"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { PositionOption } from "@/features/users/types/user.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetPositionsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getPositions = createServerFn({ method: "GET" }).handler(
  async (): Promise<PositionOption[]> => {
    try {
      const response = await http.get<PaginatedResponse<PositionOption>>(
        "/api/positions",
        { params: { limit: FILTER_OPTIONS_LIMIT } }
      )

      return response.data.data
    } catch (error) {
      logHttpError(error, "getPositions")

      throw new Error(resolveGetPositionsErrorMessage(error))
    }
  }
)
