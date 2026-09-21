import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateDepartmentSchema } from "@/features/departments/schemas/update-department.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateDepartmentErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "department.error.not_found":
      return "Không tìm thấy phòng ban."
    case "department.error.code_exists":
      return "Mã phòng ban đã tồn tại."
    case "auth.error.forbidden":
      return "Bạn không có quyền sửa phòng ban."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updateDepartment = createServerFn({ method: "POST" })
  .validator(updateDepartmentSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { departmentId, ...payload } = data
      await http.patch(`/api/departments/${departmentId}`, payload)
    } catch (error) {
      logHttpError(error, "updateDepartment")

      throw new Error(resolveUpdateDepartmentErrorMessage(error))
    }
  })
