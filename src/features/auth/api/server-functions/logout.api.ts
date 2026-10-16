import { createServerFn } from "@tanstack/react-start"

import { http, logHttpError } from "@/lib/http"
import { getAppSession } from "@/lib/session.server"

export const logout = createServerFn({ method: "POST" }).handler(
  async (): Promise<void> => {
    const session = await getAppSession()
    const { accessToken } = session

    if (accessToken) {
      try {
        await http.post("/api/auth/logout")
      } catch (error) {
        // A failed backend revoke shouldn't strand the user signed in
        // locally — the session is cleared below regardless.
        logHttpError(error, "logout")
      }
    }

    try {
      session.destroy()
    } catch (error) {
      logHttpError(error, "logout")
      throw new Error("Đã có lỗi xảy ra. Vui lòng thử lại.")
    }
  }
)
