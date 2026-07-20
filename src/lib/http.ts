import axios from "axios"
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios"

import { refreshAccessToken } from "@/lib/auth-token"
import { API_BASE_URL, HTTP_TIMEOUT_MS } from "@/lib/constants"
import { useAppSession } from "@/lib/session"

export type ApiErrorDetail = {
  property: string
  code: string
  message: string
}

// Backend error contract. errorCode is namespaced as "<domain>.error.<reason>"
// (e.g. "user.error.username_or_email_exists"); details is only present on
// field-level validation errors.
export type ApiErrorResponse = {
  timestamp: string
  statusCode: number
  error: string
  errorCode: string
  message: string
  details?: ApiErrorDetail[]
}

export function createHttpClient(config: AxiosRequestConfig = {}) {
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: HTTP_TIMEOUT_MS,
    withCredentials: true,
    headers: {
      Accept: "application/json",
      ...config.headers,
    },
    ...config,
  })
}

export const http = createHttpClient()

// Every server function talks to the backend through this instance, so the access
// token is attached here once instead of being read from the session and passed as
// headers at every call site.
http.interceptors.request.use(async (config) => {
  const session = await useAppSession()
  const { accessToken } = session.data

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

// Tracks configs already replayed once, so a request that 401s again after a
// refresh gives up instead of looping. A WeakSet keeps this off the config
// object itself — no axios type augmentation, no stray field on the wire.
const replayedRequests = new WeakSet<InternalAxiosRequestConfig>()

// The auth endpoints manage tokens themselves; a 401 from them is the answer,
// not something a refresh could fix.
function isAuthEndpoint(url?: string): boolean {
  return url?.startsWith("/api/auth/") ?? false
}

// The access token can lapse mid-session, long after the route guard's
// proactive refresh ran. Renew and replay once so the caller never sees it.
http.interceptors.response.use(undefined, async (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    throw error
  }

  const config = error.config

  if (
    error.response?.status !== 401 ||
    !config ||
    isAuthEndpoint(config.url) ||
    replayedRequests.has(config)
  ) {
    throw error
  }

  replayedRequests.add(config)

  try {
    await refreshAccessToken()
  } catch (refreshError) {
    logHttpError(refreshError, "refreshAccessToken")

    // Surface the original 401, not the refresh failure: each server function
    // maps its own errors to a Vietnamese message, and the route guard is what
    // redirects to /login on the next navigation.
    throw error
  }

  // The request interceptor re-reads the session, so the replay carries the
  // freshly issued access token.
  return http.request(config)
})

export function logHttpError(error: unknown, context: string) {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    console.error(`[API Error] ${context}`, error)
    return
  }

  const apiError = error.response?.data

  console.error(`[API Error] ${context}`, {
    code: error.code,
    errorCode: apiError?.errorCode,
    message: error.message,
    method: error.config?.method?.toUpperCase(),
    url: error.config?.url,
    baseURL: error.config?.baseURL,
    status: error.response?.status,
    statusText: error.response?.statusText,
    responseMessage: apiError?.message,
    details: apiError?.details,
  })
}
