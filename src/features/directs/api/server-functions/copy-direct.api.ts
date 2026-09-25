import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { copyDirectSchema } from "@/features/directs/schemas/copy-direct.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCopyDirectErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "item.error.not_found":
      return "Không tìm thấy vật tư."
    case "item.error.code_exists":
      return "Mã vật tư đã tồn tại."
    case "item.error.direct_code_required":
      return "Vui lòng nhập mã vật tư."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// POST /api/items/:id/copy — the backend returns 204; the caller invalidates ["directs"].
export const copyDirect = createServerFn({ method: "POST" })
  .validator(copyDirectSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/items/${data.itemId}/copy`, {
        code: data.code,
        name: data.name,
      })
    } catch (error) {
      logHttpError(error, "copyDirect")

      throw new Error(resolveCopyDirectErrorMessage(error))
    }
  })
