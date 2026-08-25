import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createUnitSchema } from "@/features/units/schemas/create-unit.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateUnitErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "unit.error.code_exists":
      return "Mã đơn vị tính đã tồn tại."
    case "unit.error.scopes_required":
      return "Vui lòng chọn ít nhất một phạm vi sử dụng."
    case "auth.error.forbidden":
      return "Bạn không có quyền tạo đơn vị tính."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const createUnit = createServerFn({ method: "POST" })
  .validator(createUnitSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post("/api/units", data)
    } catch (error) {
      logHttpError(error, "createUnit")

      throw new Error(resolveCreateUnitErrorMessage(error))
    }
  })
