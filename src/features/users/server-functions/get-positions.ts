import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import { useAppSession } from "@/lib/session"
import type { ApiErrorResponse } from "@/lib/http"
import type { Position } from "@/features/users/types/organization.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetPositionsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getPositions = createServerFn({ method: "GET" }).handler(
  async (): Promise<Position[]> => {
    try {
      const session = await useAppSession()
      const { accessToken } = session.data

      const response = await http.get<Position[]>("/api/positions", {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      })

      return response.data
    } catch (error) {
      logHttpError(error, "getPositions")

      throw new Error(resolveGetPositionsErrorMessage(error))
    }
  }
)
