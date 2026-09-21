import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveDeleteDepartmentErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "department.error.not_found":
      return "Không tìm thấy phòng ban."
    case "department.error.in_use":
      return "Phòng ban đang có chức vụ hoặc nhân sự, không thể xoá."
    case "auth.error.forbidden":
      return "Bạn không có quyền xoá phòng ban."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const deleteDepartment = createServerFn({ method: "POST" })
  .validator(z.object({ departmentId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.delete(`/api/departments/${data.departmentId}`)
    } catch (error) {
      logHttpError(error, "deleteDepartment")

      throw new Error(resolveDeleteDepartmentErrorMessage(error))
    }
  })
