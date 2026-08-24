import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateRoleSchema } from "@/features/roles/schemas/update-role.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateRoleErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "role.error.not_found":
      return "Không tìm thấy vai trò."
    case "role.error.code_exists":
      return "Mã vai trò đã tồn tại."
    case "role.error.system_readonly":
      return "Không thể sửa vai trò hệ thống."
    case "role.error.invalid_permission":
      return "Có quyền không hợp lệ trong danh sách đã chọn."
    case "role.error.elevation_forbidden":
      return "Bạn không có quyền cấp quyền Super Admin cho vai trò này."
    case "auth.error.forbidden":
      return "Bạn không có quyền sửa vai trò."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updateRole = createServerFn({ method: "POST" })
  .validator(updateRoleSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { roleId, ...payload } = data
      await http.patch(`/api/roles/${roleId}`, payload)
    } catch (error) {
      logHttpError(error, "updateRole")

      throw new Error(resolveUpdateRoleErrorMessage(error))
    }
  })
