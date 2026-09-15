import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createDepartmentSchema } from "@/features/departments/schemas/create-department.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateDepartmentErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "department.error.code_exists":
      return "Mã phòng ban đã tồn tại."
    case "auth.error.forbidden":
      return "Bạn không có quyền tạo phòng ban."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const createDepartment = createServerFn({ method: "POST" })
  .validator(createDepartmentSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post("/api/departments", data)
    } catch (error) {
      logHttpError(error, "createDepartment")

      throw new Error(resolveCreateDepartmentErrorMessage(error))
    }
  })
