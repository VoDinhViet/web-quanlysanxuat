import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveDeleteUnitErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "unit.error.not_found":
      return "Không tìm thấy đơn vị tính."
    case "unit.error.in_use":
      return "Đơn vị tính đang được vật tư/sản phẩm sử dụng, không thể xoá."
    case "auth.error.forbidden":
      return "Bạn không có quyền xoá đơn vị tính."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const deleteUnit = createServerFn({ method: "POST" })
  .validator(z.object({ unitId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.delete(`/api/units/${data.unitId}`)
    } catch (error) {
      logHttpError(error, "deleteUnit")

      throw new Error(resolveDeleteUnitErrorMessage(error))
    }
  })
