import { createServerFn } from "@tanstack/react-start"

import { loginActionSchema } from "@/features/auth/schemas/login.schema"
import {
  getHttpErrorCode,
  getHttpErrorMessage,
  http,
  logHttpError,
} from "@/lib/http"
import { useAppSession } from "@/lib/session"
import type { LoginResponse } from "@/features/auth/types/login.type"
import type { ActionResult } from "@/lib/server-action"

function getLoginErrorMessage(error: unknown) {
  const errorCode = getHttpErrorCode(error)

  switch (errorCode) {
    case "user.error.invalid_credentials":
      return "Email hoặc mật khẩu không chính xác."

    default:
      return getHttpErrorMessage(error)
  }
}

export const loginWithEmailPassword = createServerFn({ method: "POST" })
  .validator(loginActionSchema)
  .handler(async ({ data }): Promise<ActionResult> => {
    try {
      const { redirectTo, ...payload } = data
      void redirectTo

      const response = await http.post<LoginResponse>("/api/auth/login", payload)
      const session = await useAppSession()

      await session.update(response.data)

      return { success: true }
    } catch (error) {
      logHttpError(error, "loginWithEmailPassword")

      return {
        success: false,
        message: getLoginErrorMessage(error),
      }
    }
  })
