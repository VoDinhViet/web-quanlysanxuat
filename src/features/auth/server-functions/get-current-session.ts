import { createServerFn } from "@tanstack/react-start"

import { logHttpError } from "@/lib/http"
import { useAppSession } from "@/lib/session"
import { refreshSession } from "@/features/auth/server-functions/refresh-session"
import type { CurrentSession } from "@/features/auth/types/login.type"

export const getCurrentSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<CurrentSession> => {
    let session = await useAppSession()
    const isExpired =
      !session.data.tokenExpires || session.data.tokenExpires <= Date.now()

    // The access token lapsed but a refresh token is still on hand — renew the
    // session transparently instead of forcing a re-login. A failed refresh is
    // swallowed here; the still-expired session data is re-validated below and
    // reported as invalid either way.
    if (isExpired && session.data.refreshToken) {
      try {
        await refreshSession()
        session = await useAppSession()
      } catch (error) {
        logHttpError(error, "getCurrentSession")
      }
    }

    const { userId, tokenExpires } = session.data

    // A browser-session cookie (keepSignedIn unchecked) carries no maxAge, so the
    // server-side expiry is the only 7-day bound that always holds.
    if (!userId || !tokenExpires || tokenExpires <= Date.now()) {
      throw new Error("Phiên đăng nhập không hợp lệ.")
    }

    return { userId }
  }
)
