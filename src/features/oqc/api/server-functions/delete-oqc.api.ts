import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveDeleteOqcErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "oqc_inspection.error.not_found":
      return "Không tìm thấy phiếu OQC."
    case "oqc_inspection.error.not_deletable":
      return "Chỉ xoá được phiếu chưa kiểm."
    case "auth.error.forbidden":
      return "Bạn không có quyền xoá phiếu OQC."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Xoá cứng — chỉ khi còn NOT_INSPECTED. Xem OqcDetailActions.tsx.
export const deleteOqc = createServerFn({ method: "POST" })
  .validator(z.object({ oqcId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.delete(`/api/oqc/${data.oqcId}`)
    } catch (error) {
      logHttpError(error, "deleteOqc")

      throw new Error(resolveDeleteOqcErrorMessage(error))
    }
  })
