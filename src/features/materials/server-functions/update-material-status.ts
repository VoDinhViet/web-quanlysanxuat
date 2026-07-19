import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateMaterialStatusSchema } from "@/features/materials/schemas/update-material-status.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { Material } from "@/features/materials/types/material.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateMaterialStatusErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "material.error.not_found":
      return "Không tìm thấy vật tư."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updateMaterialStatus = createServerFn({ method: "POST" })
  .validator(updateMaterialStatusSchema)
  .handler(async ({ data }): Promise<Material> => {
    try {
      const response = await http.patch<Material>(
        `/api/materials/${data.materialId}`,
        { status: data.status }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "updateMaterialStatus")

      throw new Error(resolveUpdateMaterialStatusErrorMessage(error))
    }
  })
