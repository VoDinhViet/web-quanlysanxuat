import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createRoleSchema } from "@/features/roles/schemas/create-role.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateRoleErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "role.error.code_exists":
      return "Mã vai trò đã tồn tại."
    case "role.error.invalid_permission":
      return "Có quyền không hợp lệ trong danh sách đã chọn."
    case "role.error.elevation_forbidden":
      return "Bạn không có quyền cấp quyền Super Admin cho vai trò này."
    case "auth.error.forbidden":
      return "Bạn không có quyền tạo vai trò."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const createRole = createServerFn({ method: "POST" })
  .validator(createRoleSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post("/api/roles", data)
    } catch (error) {
      logHttpError(error, "createRole")

      throw new Error(resolveCreateRoleErrorMessage(error))
    }
  })
