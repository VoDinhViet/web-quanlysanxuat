import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { saveNcrCostLinesSchema } from "@/features/ncrs/schemas/save-ncr-cost-lines.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveSaveNcrCostLinesErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "ncr.error.not_found":
      return "Không tìm thấy NCR."
    case "auth.error.forbidden":
      return "Bạn không có quyền sửa dự toán chi phí NCR."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const saveNcrCostLines = createServerFn({ method: "POST" })
  .validator(saveNcrCostLinesSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { ncrId, ...payload } = data
      await http.put(`/api/ncrs/${ncrId}/cost-lines`, payload)
    } catch (error) {
      logHttpError(error, "saveNcrCostLines")

      throw new Error(resolveSaveNcrCostLinesErrorMessage(error))
    }
  })
