import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { Role } from "@/lib/types/role.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetRoleErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "role.error.not_found":
      return "Không tìm thấy vai trò."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getRole = createServerFn({ method: "GET" })
  .validator(z.object({ roleId: z.uuid() }))
  .handler(async ({ data }): Promise<Role> => {
    try {
      const response = await http.get<Role>(`/api/roles/${data.roleId}`)

      return response.data
    } catch (error) {
      logHttpError(error, "getRole")

      throw new Error(resolveGetRoleErrorMessage(error))
    }
  })
