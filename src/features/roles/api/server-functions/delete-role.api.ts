import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveDeleteRoleErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "role.error.not_found":
      return "Không tìm thấy vai trò."
    case "role.error.system_readonly":
      return "Không thể xoá vai trò hệ thống."
    case "role.error.in_use":
      return "Vai trò đang được gán cho tài khoản, không thể xoá."
    case "auth.error.forbidden":
      return "Bạn không có quyền xoá vai trò."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const deleteRole = createServerFn({ method: "POST" })
  .validator(z.object({ roleId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.delete(`/api/roles/${data.roleId}`)
    } catch (error) {
      logHttpError(error, "deleteRole")

      throw new Error(resolveDeleteRoleErrorMessage(error))
    }
  })
