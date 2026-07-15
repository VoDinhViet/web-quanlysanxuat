import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { loginSchema } from "@/features/auth/schemas/login.schema"
import { http, logHttpError } from "@/lib/http"
import { decodeJwtExpiry } from "@/lib/jwt"
import { useAppSession } from "@/lib/session"
import type { ApiErrorResponse } from "@/lib/http"
import type { AuthLoginResponse } from "@/features/auth/types/login.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveLoginErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "user.error.invalid_credentials":
      return "Tài khoản hoặc mật khẩu không đúng."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const loginWithEmailPassword = createServerFn({ method: "POST" })
  .validator(loginSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { keepSignedIn, ...credentials } = data
      const response = await http.post<AuthLoginResponse>(
        "/api/auth/login",
        credentials
      )
      const auth = response.data

      const session = await useAppSession({ persist: keepSignedIn })

      await session.update({
        userId: auth.userId,
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
        tokenExpires: decodeJwtExpiry(auth.accessToken) ?? Date.now(),
      })
    } catch (error) {
      logHttpError(error, "loginWithEmailPassword")

      throw new Error(resolveLoginErrorMessage(error))
    }
  })
