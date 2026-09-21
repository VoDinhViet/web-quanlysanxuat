import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveDeletePositionErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "position.error.not_found":
      return "Không tìm thấy chức vụ."
    case "position.error.in_use":
      return "Chức vụ đang có nhân sự, không thể xoá."
    case "auth.error.forbidden":
      return "Bạn không có quyền xoá chức vụ."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const deletePosition = createServerFn({ method: "POST" })
  .validator(z.object({ positionId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.delete(`/api/positions/${data.positionId}`)
    } catch (error) {
      logHttpError(error, "deletePosition")

      throw new Error(resolveDeletePositionErrorMessage(error))
    }
  })
