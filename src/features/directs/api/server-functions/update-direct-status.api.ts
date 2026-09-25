import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateDirectStatusSchema } from "@/features/directs/schemas/update-direct-status.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateDirectStatusErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "item.error.not_found":
      return "Không tìm thấy vật tư."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updateDirectStatus = createServerFn({ method: "POST" })
  .validator(updateDirectStatusSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.patch(`/api/items/${data.directId}`, {
        status: data.status,
      })
    } catch (error) {
      logHttpError(error, "updateDirectStatus")

      throw new Error(resolveUpdateDirectStatusErrorMessage(error))
    }
  })
