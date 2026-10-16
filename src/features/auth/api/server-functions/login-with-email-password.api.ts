import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { loginSchema } from "@/features/auth/schemas/login.schema"
import { http, logHttpError } from "@/lib/http"
import { decodeJwtExpiry } from "@/lib/jwt.server"
import { SESSION_MAX_AGE_SECONDS, getAppSession } from "@/lib/session.server"
import type { ApiErrorResponse } from "@/lib/http"
import type { AuthLoginResponse } from "@/lib/types/login.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveLoginErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "credential.error.invalid_credentials":
      return "Tài khoản hoặc mật khẩu không đúng."
    // BE dùng chung mã lỗi này cho tài khoản đã bị khóa (credentialEnabled=false)
    // và nhân sự đã nghỉ việc — cả hai đều "không còn được phép đăng nhập".
    case "user.error.resigned":
      return "Tài khoản đã bị khóa hoặc ngừng hoạt động. Vui lòng liên hệ quản trị viên."
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

      const session = await getAppSession({ persist: keepSignedIn })

      session.userId = auth.userId
      session.accessToken = auth.accessToken
      session.refreshToken = auth.refreshToken
      session.tokenExpires = decodeJwtExpiry(auth.accessToken) ?? Date.now()
      session.persist = keepSignedIn
      session.sessionExpires = Date.now() + SESSION_MAX_AGE_SECONDS * 1000
      await session.save()
    } catch (error) {
      logHttpError(error, "loginWithEmailPassword")

      throw new Error(resolveLoginErrorMessage(error))
    }
  })
