import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { IqcStats } from "@/lib/types/iqc.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetIqcStatsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getIqcStats = createServerFn({ method: "GET" }).handler(
  async (): Promise<IqcStats> => {
    try {
      const response = await http.get<IqcStats>("/api/iqc/stats")

      return response.data
    } catch (error) {
      logHttpError(error, "getIqcStats")

      throw new Error(resolveGetIqcStatsErrorMessage(error))
    }
  }
)
