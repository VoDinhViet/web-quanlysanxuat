import axios from "axios"
import type { AxiosRequestConfig } from "axios"

const DEFAULT_TIMEOUT = 30_000
const DEFAULT_BASE_URL = ""

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

export const API_BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_BASE_URL

export function createHttpClient(config: AxiosRequestConfig = {}) {
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: DEFAULT_TIMEOUT,
    withCredentials: true,
    headers: {
      Accept: "application/json",
      ...config.headers,
    },
    ...config,
  })
}

export const http = createHttpClient()

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
