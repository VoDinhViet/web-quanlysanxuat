import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateUserSchema } from "@/features/users/schemas/update-user.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { User } from "@/features/users/types/user.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateUserErrorMessage(error: unknown): string {
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

export const updateUser = createServerFn({ method: "POST" })
  .validator(updateUserSchema)
  .handler(async ({ data }): Promise<User> => {
    try {
      const { userId, ...payload } = data
      const response = await http.put<User>(`/api/users/${userId}`, payload)

      return response.data
    } catch (error) {
      logHttpError(error, "updateUser")

      throw new Error(resolveUpdateUserErrorMessage(error))
    }
  })
