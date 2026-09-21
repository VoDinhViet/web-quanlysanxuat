import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { IqcDetail } from "@/lib/types/iqc.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetIqcErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "iqc_inspection.error.not_found":
      return "Không tìm thấy phiếu IQC."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem phiếu IQC này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getIqc = createServerFn({ method: "GET" })
  .validator(z.object({ iqcId: z.uuid() }))
  .handler(async ({ data }): Promise<IqcDetail> => {
    try {
      const response = await http.get<IqcDetail>(`/api/iqc/${data.iqcId}`)

      return response.data
    } catch (error) {
      logHttpError(error, "getIqc")

      throw new Error(resolveGetIqcErrorMessage(error))
    }
  })
