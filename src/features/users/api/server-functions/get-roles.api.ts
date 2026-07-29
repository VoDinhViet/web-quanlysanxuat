import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { Role } from "@/lib/types/role.type"

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
  async (): Promise<Role[]> => {
    try {
      const response = await http.get<Role[]>("/api/roles")

      return response.data
    } catch (error) {
      logHttpError(error, "getRoles")

      throw new Error(resolveGetRolesErrorMessage(error))
    }
  }
)
