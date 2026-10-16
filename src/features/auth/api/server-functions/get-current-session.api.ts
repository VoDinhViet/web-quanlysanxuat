import { createServerFn } from "@tanstack/react-start"
import { setResponseHeader } from "@tanstack/react-start/server"

import {
  isAccessTokenExpired,
  refreshAccessToken,
} from "@/lib/access-token.server"
import { logHttpError } from "@/lib/http"
import { getAppSession, isSessionExpired } from "@/lib/session.server"
import type { CurrentSession } from "@/lib/types/login.type"

export const getCurrentSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<CurrentSession> => {
    // Gọi lại đúng URL /_serverFn mọi lần (GET không tham số) — không set no-store thì trình
    // duyệt/proxy trung gian có thể phục vụ nhầm phiên của tài khoản trước đó sau khi đổi tài
    // khoản mà không F5 (BUG-005).
    setResponseHeader("Cache-Control", "no-store")

    let session = await getAppSession()

    // Renew ahead of the loaders rather than letting each of their requests
    // 401 first. `isAccessTokenExpired` keeps a safety margin, so a token with
    // seconds left is treated as spent. A failed refresh is swallowed — the
    // session data is re-validated below and reported as invalid either way.
    if (isAccessTokenExpired(session.tokenExpires) && session.refreshToken) {
      try {
        await refreshAccessToken()
        session = await getAppSession()
      } catch (error) {
        logHttpError(error, "getCurrentSession")
      }
    }

    const { userId, tokenExpires } = session

    // No safety margin here — a token that is genuinely still valid is no
    // reason to sign someone out. A browser-session cookie (keepSignedIn
    // unchecked) carries no maxAge, so this server-side expiry is the only
    // bound that always holds.
    if (
      !userId ||
      !tokenExpires ||
      tokenExpires <= Date.now() ||
      isSessionExpired(session)
    ) {
      throw new Error("Phiên đăng nhập không hợp lệ.")
    }

    return { userId }
  }
)
