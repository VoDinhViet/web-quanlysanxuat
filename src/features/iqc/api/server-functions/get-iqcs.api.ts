import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { iqcSearchSchema } from "@/features/iqc/schemas/iqc-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { Iqc } from "@/lib/types/iqc.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetIqcsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách IQC."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getIqcs = createServerFn({ method: "GET" })
  .validator(iqcSearchSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<Iqc>> => {
    try {
      const response = await http.get<PaginatedResponse<Iqc>>("/api/iqc", {
        params: data,
      })

      return response.data
    } catch (error) {
      logHttpError(error, "getIqcs")

      throw new Error(resolveGetIqcsErrorMessage(error))
    }
  })
