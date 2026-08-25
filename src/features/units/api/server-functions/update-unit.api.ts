import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateUnitSchema } from "@/features/units/schemas/update-unit.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateUnitErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "unit.error.not_found":
      return "Không tìm thấy đơn vị tính."
    case "unit.error.code_exists":
      return "Mã đơn vị tính đã tồn tại."
    case "unit.error.scopes_required":
      return "Vui lòng chọn ít nhất một phạm vi sử dụng."
    case "unit.error.scope_in_use":
      return "Không thể bỏ phạm vi này: đang có vật tư/sản phẩm dùng đơn vị tính."
    case "auth.error.forbidden":
      return "Bạn không có quyền sửa đơn vị tính."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updateUnit = createServerFn({ method: "POST" })
  .validator(updateUnitSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { unitId, ...payload } = data
      await http.patch(`/api/units/${unitId}`, payload)
    } catch (error) {
      logHttpError(error, "updateUnit")

      throw new Error(resolveUpdateUnitErrorMessage(error))
    }
  })
