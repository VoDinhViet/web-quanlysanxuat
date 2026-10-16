import { getCookie, getRequest, setCookie } from "@tanstack/react-start/server"
import { getIronSession } from "iron-session"
import type { CookieJar, SessionOptions } from "iron-session"
import type { AppSessionData } from "@/lib/types/session.type"

const SESSION_COOKIE_NAME = "app-session"
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7
const MIN_SESSION_SECRET_LENGTH = 32

function requireSessionSecret(): string {
  const secret = process.env.SESSION_SECRET

  if (!secret || secret.length < MIN_SESSION_SECRET_LENGTH) {
    throw new Error(
      `SESSION_SECRET must be at least ${MIN_SESSION_SECRET_LENGTH} characters. Copy .env.example to .env and set a long random value.`
    )
  }

  return secret
}

// `getCookie` only sees the incoming request, so a session saved earlier in the
// same request (token refresh) would be re-read stale. Writes are mirrored here,
// per request, and take precedence on read.
const cookiesWrittenByRequest = new WeakMap<Request, Map<string, string>>()

function createRequestCookieJar(): CookieJar {
  const request = getRequest()
  const writtenCookies = cookiesWrittenByRequest.get(request) ?? new Map()

  cookiesWrittenByRequest.set(request, writtenCookies)

  return {
    read: (name) =>
      (writtenCookies.has(name) ? writtenCookies.get(name) : getCookie(name)) ||
      undefined,
    write: (name, value, options) => {
      writtenCookies.set(name, value)
      setCookie(name, value, options)
    },
  }
}

// An explicit `maxAge: undefined` is iron-session's way to ask for a browser-session cookie.
function buildSessionOptions(persist: boolean): SessionOptions {
  return {
    cookieName: SESSION_COOKIE_NAME,
    password: requireSessionSecret(),
    ttl: SESSION_MAX_AGE_SECONDS,
    cookieOptions: {
      ...(persist ? {} : { maxAge: undefined }),
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
      path: "/",
    },
  }
}

type AppSessionOptions = {
  /**
   * false → no cookie maxAge, so the session ends when the browser closes
   * ("duy trì đăng nhập" unchecked). Pass it at login only; later calls omit it
   * and follow the `persist` flag stored in the session.
   */
  persist?: boolean
}

export async function getAppSession(options: AppSessionOptions = {}) {
  const session = await getIronSession<AppSessionData>(
    createRequestCookieJar(),
    buildSessionOptions(options.persist ?? true)
  )

  if (options.persist === undefined && session.persist === false) {
    session.updateConfig(buildSessionOptions(false))
  }

  return session
}

// A missing `sessionExpires` counts as expired: login always sets it.
export function isSessionExpired(session: AppSessionData): boolean {
  return !session.sessionExpires || session.sessionExpires <= Date.now()
}
