import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import type { z } from "zod"

import { updateMaterialSchema } from "@/features/materials/schemas/update-material.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { Material } from "@/features/materials/types/material.type"

type ValidatedUpdate = Omit<z.output<typeof updateMaterialSchema>, "materialId">

// The edit form always submits the complete form state, so an optional field
// that validated to undefined was cleared by the user. On PATCH a missing key
// means "no change" — send an explicit null so the backend actually clears it
// (UpdateMaterialReqDto marks all of these nullable).
function toUpdateMaterialPayload(data: ValidatedUpdate) {
  return {
    ...data,
    clientId: data.clientId ?? null,
    imageUrl: data.imageUrl ?? null,
    note: data.note ?? null,
    materialGrade: data.materialGrade ?? null,
    technicalStandard: data.technicalStandard ?? null,
    dimensions: data.dimensions ?? null,
    specificWeight: data.specificWeight ?? null,
    colorSurface: data.colorSurface ?? null,
    description: data.description ?? null,
    origin: data.origin ?? null,
    preferredSupplierId: data.preferredSupplierId ?? null,
    leadTime: data.leadTime ?? null,
  }
}

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
    case "unit.error.not_found":
      return "Đơn vị tính không tồn tại."
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
        toUpdateMaterialPayload(payload)
      )

      return response.data
    } catch (error) {
      logHttpError(error, "updateMaterial")

      throw new Error(resolveUpdateMaterialErrorMessage(error))
    }
  })
