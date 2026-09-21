import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { DepartmentDetail } from "@/lib/types/department.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetDepartmentErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "department.error.not_found":
      return "Không tìm thấy phòng ban."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getDepartment = createServerFn({ method: "GET" })
  .validator(z.object({ departmentId: z.uuid() }))
  .handler(async ({ data }): Promise<DepartmentDetail> => {
    try {
      const response = await http.get<DepartmentDetail>(
        `/api/departments/${data.departmentId}`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getDepartment")

      throw new Error(resolveGetDepartmentErrorMessage(error))
    }
  })
