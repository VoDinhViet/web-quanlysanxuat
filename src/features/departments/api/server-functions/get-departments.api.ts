import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { Department } from "@/lib/types/department.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetDepartmentsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getDepartments = createServerFn({ method: "GET" }).handler(
  async (): Promise<Department[]> => {
    try {
      const response = await http.get<PaginatedResponse<Department>>(
        "/api/departments",
        { params: { limit: 100 } }
      )

      return response.data.data
    } catch (error) {
      logHttpError(error, "getDepartments")

      throw new Error(resolveGetDepartmentsErrorMessage(error))
    }
  }
)
