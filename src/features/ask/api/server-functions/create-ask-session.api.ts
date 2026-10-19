import { createServerFn } from "@tanstack/react-start"
import { setResponseHeader } from "@tanstack/react-start/server"
import axios from "axios"
import { z } from "zod"

import { readAskEnv } from "@/features/ask/api/ask-env.server"
import { createHttpClient, logHttpError } from "@/lib/http"
import {
  isAccessTokenExpired,
  refreshAccessToken,
} from "@/lib/access-token.server"
import { getAppSession, isSessionExpired } from "@/lib/session.server"
import type { AskSession } from "@/lib/types/ask.type"

const GENERIC_ERROR_MESSAGE = "Không mở được Ask. Vui lòng thử lại."

const askSessionSchema = z.object({
  token: z.string().min(1),
  expiresAt: z.string().min(1),
  displayName: z.string(),
})

function resolveCreateAskSessionErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.status) {
    case 401:
    case 403:
      return "Ask không nhận phiên đăng nhập hiện tại. Vui lòng đăng nhập lại."
    case 429:
      return "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Swaps the signed-in user's ERP access token for a short-lived Ask session. The token and the
// app key only travel server to server: the browser receives just the Ask session (15 minutes).
export const createAskSession = createServerFn({ method: "POST" }).handler(
  async (): Promise<AskSession> => {
    setResponseHeader("Cache-Control", "no-store")

    const askEnv = readAskEnv()

    if (!askEnv?.appKey) {
      throw new Error("Ask chưa được cấu hình.")
    }

    const { baseUrl, appId, appKey } = askEnv

    const currentSession = await getAppSession()

    if (isSessionExpired(currentSession) || !currentSession.accessToken) {
      throw new Error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.")
    }

    try {
      if (isAccessTokenExpired(currentSession.tokenExpires)) {
        await refreshAccessToken()
      }

      // `refreshAccessToken` saves through its own session handle, so read the token again.
      const { accessToken } = await getAppSession()
      // A dedicated client on purpose: the shared `http` one targets the ERP BE and would attach
      // the ERP bearer token to a request for another host. No redirects, so the app key and
      // user token never follow a redirect to a different host.
      const aiPlatform = createHttpClient({
        baseURL: baseUrl,
        withCredentials: false,
        maxRedirects: 0,
        proxy: false,
      })
      const response = await aiPlatform.post<unknown>(
        `/api/embed/apps/${encodeURIComponent(appId)}/session`,
        undefined,
        {
          headers: {
            "X-Embed-App-Key": appKey,
            "X-User-Token": accessToken,
          },
        }
      )

      return askSessionSchema.parse(response.data)
    } catch (error) {
      logHttpError(error, "createAskSession")

      throw new Error(resolveCreateAskSessionErrorMessage(error))
    }
  }
)
