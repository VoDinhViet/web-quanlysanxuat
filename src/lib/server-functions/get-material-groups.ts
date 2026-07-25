import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { FILTER_OPTIONS_LIMIT } from "@/lib/constants"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { MaterialGroupRef } from "@/lib/types/material.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetMaterialGroupsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getMaterialGroups = createServerFn({ method: "GET" }).handler(
  async (): Promise<MaterialGroupRef[]> => {
    try {
      const response = await http.get<PaginatedResponse<MaterialGroupRef>>(
        "/api/material-groups",
        { params: { limit: FILTER_OPTIONS_LIMIT } }
      )

      return response.data.data
    } catch (error) {
      logHttpError(error, "getMaterialGroups")

      throw new Error(resolveGetMaterialGroupsErrorMessage(error))
    }
  }
)
