import { createServerFn } from "@tanstack/react-start"

import { http, logHttpError } from "@/lib/http"
import { useAppSession } from "@/lib/session"

export const logout = createServerFn({ method: "POST" }).handler(
  async (): Promise<void> => {
    const session = await useAppSession()
    const { accessToken } = session.data

    if (accessToken) {
      try {
        await http.post("/api/auth/logout", undefined, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      } catch (error) {
        // A failed backend revoke shouldn't strand the user signed in
        // locally — the session is cleared below regardless.
        logHttpError(error, "logout")
      }
    }

    try {
      await session.clear()
    } catch (error) {
      logHttpError(error, "logout")
      throw new Error("Đã có lỗi xảy ra. Vui lòng thử lại.")
    }
  }
)
