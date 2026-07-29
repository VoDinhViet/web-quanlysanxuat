import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { usersSearchSchema } from "@/features/users/schemas/users-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { User } from "@/lib/types/user.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetUsersErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getUsers = createServerFn({ method: "GET" })
  .validator(usersSearchSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<User>> => {
    try {
      const response = await http.get<PaginatedResponse<User>>("/api/users", {
        params: data,
      })

      return response.data
    } catch (error) {
      logHttpError(error, "getUsers")

      throw new Error(resolveGetUsersErrorMessage(error))
    }
  })
