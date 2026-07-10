import axios from "axios"
import type { AxiosRequestConfig } from "axios"

const DEFAULT_TIMEOUT = 30_000
const DEFAULT_BASE_URL = "/api"

export type ApiErrorResponse = {
  timestamp?: string
  statusCode?: number
  error?: string
  errorCode?: string
  message?: string
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

  console.error(`[API Error] ${context}`, {
    code: error.code,
    errorCode: error.response?.data.errorCode,
    message: error.message,
    method: error.config?.method?.toUpperCase(),
    url: error.config?.url,
    baseURL: error.config?.baseURL,
    status: error.response?.status,
    statusText: error.response?.statusText,
    responseMessage: error.response?.data.message,
  })
}

export function getHttpErrorCode(error: unknown) {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return undefined
  }

  return error.response?.data.errorCode
}

export function getHttpErrorMessage(error: unknown) {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return "Đã có lỗi xảy ra. Vui lòng thử lại."
  }

  return (
    error.response?.data.message ||
    error.message ||
    "Đã có lỗi xảy ra. Vui lòng thử lại."
  )
}
