import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { Department } from "@/lib/types/department.type"

const getDepartmentsSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  q: z.string().optional(),
  isActive: z.boolean().optional(),
})

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

export const getDepartments = createServerFn({ method: "GET" })
  .validator(getDepartmentsSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<Department>> => {
    try {
      const response = await http.get<PaginatedResponse<Department>>(
        "/api/departments",
        { params: data }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getDepartments")

      throw new Error(resolveGetDepartmentsErrorMessage(error))
    }
  })
