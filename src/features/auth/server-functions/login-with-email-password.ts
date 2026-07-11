import { createServerFn } from "@tanstack/react-start"
import { isAxiosError } from "axios"

import { mockLoginWithEmailPassword } from "@/features/auth/mocks/auth.mock"
import { loginSchema } from "@/features/auth/schemas/login.schema"
import { getHttpErrorCode, http, logHttpError } from "@/lib/http"
import { useAppSession } from "@/lib/session"
import type { AuthLoginResponse } from "@/features/auth/types/login.type"
import type { ActionResult } from "@/lib/server-action"

const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === "true"

// The mock accepts a fixed dev credential pair without contacting the authentication
// service. A production build with it still enabled would bypass authentication.
if (import.meta.env.PROD && USE_MOCK_AUTH) {
  throw new Error(
    "VITE_USE_MOCK_AUTH is enabled in a production build. Unset it so login goes through the real authentication service."
  )
}

const INVALID_CREDENTIALS_MESSAGE = "Email hoặc mật khẩu không đúng."
const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: INVALID_CREDENTIALS_MESSAGE,
}

function resolveLoginErrorMessage(error: unknown): string {
  const errorCode = getHttpErrorCode(error)

  if (errorCode) {
    return LOGIN_ERROR_MESSAGES[errorCode] ?? GENERIC_ERROR_MESSAGE
  }

  if (isAxiosError(error) && error.response?.status === 401) {
    return INVALID_CREDENTIALS_MESSAGE
  }

  return GENERIC_ERROR_MESSAGE
}

async function requestLogin(
  email: string,
  password: string
): Promise<AuthLoginResponse> {
  const response = await http.post<AuthLoginResponse>("/auth/login", {
    email,
    password,
  })

  return response.data
}

export const loginWithEmailPassword = createServerFn({ method: "POST" })
  .validator(loginSchema)
  .handler(async ({ data }): Promise<ActionResult> => {
    try {
      const auth = USE_MOCK_AUTH
        ? mockLoginWithEmailPassword(data.email, data.password)
        : await requestLogin(data.email, data.password)

      if (!auth) {
        return { success: false, message: INVALID_CREDENTIALS_MESSAGE }
      }

      const session = await useAppSession({ persist: data.keepSignedIn })

      await session.update({
        userId: auth.userId,
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
        tokenExpires: Date.now() + auth.expiresIn * 1000,
      })

      return { success: true }
    } catch (error) {
      logHttpError(error, "loginWithEmailPassword")

      return { success: false, message: resolveLoginErrorMessage(error) }
    }
  })
