import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveDeleteMaterialErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "material.error.not_found":
      return "Không tìm thấy vật tư."
    case "material.error.has_transactions":
      return "Không thể xóa vì vật tư đã phát sinh giao dịch. Vui lòng chuyển trạng thái sang Ngừng sử dụng."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const deleteMaterial = createServerFn({ method: "POST" })
  .validator(z.object({ materialId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.delete(`/api/materials/${data.materialId}`)
    } catch (error) {
      logHttpError(error, "deleteMaterial")

      throw new Error(resolveDeleteMaterialErrorMessage(error))
    }
  })
