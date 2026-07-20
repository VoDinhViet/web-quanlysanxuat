import axios from "axios"

import { API_BASE_URL, HTTP_TIMEOUT_MS } from "@/lib/constants"
import { decodeJwtExpiry } from "@/lib/jwt"
import { useAppSession } from "@/lib/session"

// Refresh this long before the access token actually lapses, so a token with
// only seconds left doesn't pass the guard and then 401 on the very next call.
const TOKEN_EXPIRY_SKEW_MS = 60_000

// Deliberately interceptor-free: the shared `http` client attaches an
// Authorization header to every request and retries 401s by calling back into
// this module. Refreshing through it would send a dead access token along with
// the refresh and could recurse.
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: HTTP_TIMEOUT_MS,
  headers: { Accept: "application/json" },
})

type RefreshResponse = {
  accessToken: string
  refreshToken: string
}

// In-flight refreshes keyed per session, NOT a single module-level promise:
// this module is a singleton for the whole server process, so one shared
// promise would hand user A's refreshed session to user B. Entries are removed
// as soon as they settle.
const inFlightRefreshes = new Map<string, Promise<void>>()

export function isAccessTokenExpired(tokenExpires?: number): boolean {
  return !tokenExpires || tokenExpires - TOKEN_EXPIRY_SKEW_MS <= Date.now()
}

async function requestRefresh(refreshToken: string): Promise<void> {
  const response = await refreshClient.post<RefreshResponse>(
    "/api/auth/refresh",
    { refreshToken }
  )
  const refreshed = response.data
  const session = await useAppSession()

  await session.update({
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken,
    tokenExpires: decodeJwtExpiry(refreshed.accessToken) ?? Date.now(),
  })
}

/**
 * Swaps the stored refresh token for a fresh access/refresh pair and writes both
 * back to the session. Concurrent callers within one session share a single
 * request — the backend rotates and blacklists the old refresh token, so a
 * second parallel refresh would spend an already-revoked token and kill the
 * session. Throws when there is no refresh token or the backend rejects it.
 */
export async function refreshAccessToken(): Promise<void> {
  const session = await useAppSession()
  const { userId, refreshToken } = session.data

  if (!refreshToken) {
    throw new Error("Phiên đăng nhập không hợp lệ.")
  }

  const sessionKey = userId ?? refreshToken
  const pending = inFlightRefreshes.get(sessionKey)

  if (pending) {
    return pending
  }

  const refresh = requestRefresh(refreshToken).finally(() => {
    inFlightRefreshes.delete(sessionKey)
  })

  inFlightRefreshes.set(sessionKey, refresh)

  return refresh
}
