import { useSession } from "@tanstack/react-start/server"
import type { AppSessionData } from "@/lib/types/session.type"

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

function requireSessionSecret(): string {
  const secret = process.env.SESSION_SECRET

  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not set. Copy .env.example to .env and set a long random value."
    )
  }

  return secret
}

type AppSessionOptions = {
  /**
   * false → no cookie maxAge, so the session ends when the browser closes
   * ("duy trì đăng nhập" unchecked). Server-side expiry via tokenExpires still
   * bounds the session in both cases.
   */
  persist?: boolean
}

export function useAppSession(options: AppSessionOptions = {}) {
  const { persist = true } = options

  return useSession<AppSessionData>({
    name: "app-session",
    password: requireSessionSecret(),
    ...(persist ? { maxAge: SESSION_MAX_AGE_SECONDS } : {}),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
    },
  })
}
