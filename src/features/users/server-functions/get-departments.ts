import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import { useAppSession } from "@/lib/session"
import type { ApiErrorResponse } from "@/lib/http"
import type { Department } from "@/features/users/types/organization.type"

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
      const session = await useAppSession()
      const { accessToken } = session.data

      const response = await http.get<Department[]>("/api/departments", {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      })

      return response.data
    } catch (error) {
      logHttpError(error, "getDepartments")

      throw new Error(resolveGetDepartmentsErrorMessage(error))
    }
  }
)
