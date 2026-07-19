import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { materialsSearchSchema } from "@/features/materials/schemas/materials-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { Material } from "@/features/materials/types/material.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetMaterialsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getMaterials = createServerFn({ method: "GET" })
  .validator(materialsSearchSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<Material>> => {
    try {
      const response = await http.get<PaginatedResponse<Material>>(
        "/api/materials",
        { params: data }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getMaterials")

      throw new Error(resolveGetMaterialsErrorMessage(error))
    }
  })
