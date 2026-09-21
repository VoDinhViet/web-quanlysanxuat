import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateDepartmentStatusSchema } from "@/features/departments/schemas/update-department-status.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateDepartmentStatusErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "department.error.not_found":
      return "Không tìm thấy phòng ban."
    case "auth.error.forbidden":
      return "Bạn không có quyền sửa phòng ban."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updateDepartmentStatus = createServerFn({ method: "POST" })
  .validator(updateDepartmentStatusSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.patch(`/api/departments/${data.departmentId}`, {
        isActive: data.isActive,
      })
    } catch (error) {
      logHttpError(error, "updateDepartmentStatus")

      throw new Error(resolveUpdateDepartmentStatusErrorMessage(error))
    }
  })
