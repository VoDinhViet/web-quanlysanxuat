import { createServerFn } from "@tanstack/react-start"

import { logHttpError } from "@/lib/http"
import { useAppSession } from "@/lib/session"
import type { ActionResult } from "@/lib/server-action"
import type { CurrentSession } from "@/features/auth/types/login.type"

export const getCurrentSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<ActionResult<CurrentSession>> => {
    try {
      const session = await useAppSession()
      const { userId, tokenExpires } = session.data

      // A browser-session cookie (keepSignedIn unchecked) carries no maxAge, so the
      // server-side expiry is the only 7-day bound that always holds.
      if (!userId || !tokenExpires || tokenExpires <= Date.now()) {
        return { success: false, message: "Phiên đăng nhập không hợp lệ." }
      }

      return { success: true, data: { userId } }
    } catch (error) {
      logHttpError(error, "getCurrentSession")

      return { success: false, message: "Phiên đăng nhập không hợp lệ." }
    }
  }
)
