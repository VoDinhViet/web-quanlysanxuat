import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { User } from "@/features/users/types/user.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetUserErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "user.error.not_found":
      return "Không tìm thấy nhân viên."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getUser = createServerFn({ method: "GET" })
  .validator(z.object({ userId: z.uuid() }))
  .handler(async ({ data }): Promise<User> => {
    try {
      const response = await http.get<User>(`/api/users/${data.userId}`)

      return response.data
    } catch (error) {
      logHttpError(error, "getUser")

      throw new Error(resolveGetUserErrorMessage(error))
    }
  })
