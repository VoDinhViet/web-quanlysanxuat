import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveDeleteClientErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "client.error.not_found":
      return "Không tìm thấy khách hàng."
    case "client.error.in_use":
      return "Khách hàng đang được sử dụng ở đơn hàng, không thể xoá."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const deleteClient = createServerFn({ method: "POST" })
  .validator(z.object({ clientId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.delete(`/api/clients/${data.clientId}`)
    } catch (error) {
      logHttpError(error, "deleteClient")

      throw new Error(resolveDeleteClientErrorMessage(error))
    }
  })
