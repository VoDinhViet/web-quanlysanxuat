import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { Material } from "@/features/materials/types/material.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetMaterialErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "material.error.not_found":
      return "Không tìm thấy vật tư."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getMaterial = createServerFn({ method: "GET" })
  .validator(z.object({ materialId: z.uuid() }))
  .handler(async ({ data }): Promise<Material> => {
    try {
      const response = await http.get<Material>(
        `/api/materials/${data.materialId}`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getMaterial")

      throw new Error(resolveGetMaterialErrorMessage(error))
    }
  })
