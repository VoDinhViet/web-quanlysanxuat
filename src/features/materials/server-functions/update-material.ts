import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateMaterialSchema } from "@/features/materials/schemas/update-material.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { Material } from "@/features/materials/types/material.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateMaterialErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "material.error.not_found":
      return "Không tìm thấy vật tư."
    case "material.error.client_required":
      return "Vui lòng chọn khách hàng khi loại vật tư là Khách hàng."
    case "file.error.not_found":
      return "File đính kèm không còn tồn tại. Vui lòng tải lên lại."
    case "unit.error.not_found":
      return "Đơn vị tính không tồn tại."
    case "unit.error.scope_mismatch":
      return "Đơn vị tính không dùng được cho loại này."
    case "material_group.error.not_found":
      return "Nhóm vật tư không tồn tại."
    case "client.error.not_found":
      return "Khách hàng không tồn tại."
    case "supplier.error.not_found":
      return "Nhà cung cấp ưu tiên không tồn tại."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updateMaterial = createServerFn({ method: "POST" })
  .validator(updateMaterialSchema)
  .handler(async ({ data }): Promise<Material> => {
    try {
      const { materialId, ...payload } = data
      const response = await http.patch<Material>(
        `/api/materials/${materialId}`,
        payload
      )

      return response.data
    } catch (error) {
      logHttpError(error, "updateMaterial")

      throw new Error(resolveUpdateMaterialErrorMessage(error))
    }
  })
