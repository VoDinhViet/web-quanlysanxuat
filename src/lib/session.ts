import { useSession } from "@tanstack/react-start/server"
import type { AppSessionData } from "@/lib/types/session.type"

export function useAppSession() {
  return useSession<AppSessionData>({
    name: "app-session",
    password: process.env.SESSION_SECRET!,
    maxAge: 60 * 60 * 24 * 7,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
    },
  })
}
