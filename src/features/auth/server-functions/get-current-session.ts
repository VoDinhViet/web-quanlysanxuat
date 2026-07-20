import { createServerFn } from "@tanstack/react-start"

import { isAccessTokenExpired, refreshAccessToken } from "@/lib/auth-token"
import { logHttpError } from "@/lib/http"
import { useAppSession } from "@/lib/session"
import type { CurrentSession } from "@/features/auth/types/login.type"

export const getCurrentSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<CurrentSession> => {
    let session = await useAppSession()

    // Renew ahead of the loaders rather than letting each of their requests
    // 401 first. `isAccessTokenExpired` keeps a safety margin, so a token with
    // seconds left is treated as spent. A failed refresh is swallowed — the
    // session data is re-validated below and reported as invalid either way.
    if (
      isAccessTokenExpired(session.data.tokenExpires) &&
      session.data.refreshToken
    ) {
      try {
        await refreshAccessToken()
        session = await useAppSession()
      } catch (error) {
        logHttpError(error, "getCurrentSession")
      }
    }

    const { userId, tokenExpires } = session.data

    // No safety margin here — a token that is genuinely still valid is no
    // reason to sign someone out. A browser-session cookie (keepSignedIn
    // unchecked) carries no maxAge, so this server-side expiry is the only
    // bound that always holds.
    if (!userId || !tokenExpires || tokenExpires <= Date.now()) {
      throw new Error("Phiên đăng nhập không hợp lệ.")
    }

    return { userId }
  }
)
