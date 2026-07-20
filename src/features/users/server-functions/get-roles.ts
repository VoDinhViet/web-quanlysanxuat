import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { FILTER_OPTIONS_LIMIT } from "@/lib/constants"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { RoleOption } from "@/features/users/types/user.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetRolesErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách vai trò."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getRoles = createServerFn({ method: "GET" }).handler(
  async (): Promise<RoleOption[]> => {
    try {
      const response = await http.get<PaginatedResponse<RoleOption>>(
        "/api/roles",
        { params: { limit: FILTER_OPTIONS_LIMIT } }
      )

      return response.data.data
    } catch (error) {
      logHttpError(error, "getRoles")

      throw new Error(resolveGetRolesErrorMessage(error))
    }
  }
)
