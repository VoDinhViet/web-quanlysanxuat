import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import { decodeJwtExpiry } from "@/lib/jwt"
import { useAppSession } from "@/lib/session"
import type { ApiErrorResponse } from "@/lib/http"
import type { AuthLoginResponse } from "@/features/auth/types/login.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveRefreshSessionErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  // POST /auth/refresh rejects an invalid/expired/blacklisted refresh token with a
  // bare 401 (no errorCode on this endpoint), unlike the app's other error responses.
  switch (error.response?.status) {
    case 401:
      return "Phiên đăng nhập đã hết hạn."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

/**
 * Extends the session using the stored refresh token when the access token has
 * expired. Called from `getCurrentSession` so the guard can transparently renew a
 * session instead of forcing a re-login every time the access token lapses.
 */
export const refreshSession = createServerFn({ method: "POST" }).handler(
  async (): Promise<void> => {
    const session = await useAppSession()
    const { refreshToken } = session.data

    if (!refreshToken) {
      throw new Error("Phiên đăng nhập không hợp lệ.")
    }

    try {
      const response = await http.post<AuthLoginResponse>("/api/auth/refresh", {
        refreshToken,
      })
      const refreshed = response.data

      await session.update({
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        tokenExpires: decodeJwtExpiry(refreshed.accessToken) ?? Date.now(),
      })
    } catch (error) {
      logHttpError(error, "refreshSession")

      throw new Error(resolveRefreshSessionErrorMessage(error))
    }
  }
)
