import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { SupplierStats } from "@/features/suppliers/types/supplier.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetSupplierStatsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getSupplierStats = createServerFn({ method: "GET" }).handler(
  async (): Promise<SupplierStats> => {
    try {
      const response = await http.get<SupplierStats>("/api/suppliers/stats")

      return response.data
    } catch (error) {
      logHttpError(error, "getSupplierStats")

      throw new Error(resolveGetSupplierStatsErrorMessage(error))
    }
  }
)
