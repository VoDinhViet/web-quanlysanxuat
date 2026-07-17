import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { AuthUserProfile } from "@/features/auth/types/login.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetCurrentProfileErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getCurrentProfile = createServerFn({ method: "GET" }).handler(
  async (): Promise<AuthUserProfile> => {
    try {
      const response = await http.get<AuthUserProfile>("/api/users/me")

      return response.data
    } catch (error) {
      logHttpError(error, "getCurrentProfile")

      throw new Error(resolveGetCurrentProfileErrorMessage(error))
    }
  }
)
