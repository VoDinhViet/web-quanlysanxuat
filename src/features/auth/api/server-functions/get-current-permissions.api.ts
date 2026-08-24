import { createServerFn } from "@tanstack/react-start"
import { setResponseHeader } from "@tanstack/react-start/server"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PermissionCode } from "@/lib/types/permission.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetCurrentPermissionsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getCurrentPermissions = createServerFn({ method: "GET" }).handler(
  async (): Promise<PermissionCode[]> => {
    // Cùng lý do get-current-session.api.ts: chặn cache HTTP trả nhầm quyền của tài khoản trước
    // đó sau khi đổi tài khoản mà không F5 (BUG-005).
    setResponseHeader("Cache-Control", "no-store")

    try {
      const response = await http.get<{ permissions: PermissionCode[] }>(
        "/api/users/me/permissions"
      )

      return response.data.permissions
    } catch (error) {
      logHttpError(error, "getCurrentPermissions")

      throw new Error(resolveGetCurrentPermissionsErrorMessage(error))
    }
  }
)
