import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateMaterialSchema } from "@/features/materials/schemas/update-material.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { resolveApiFileId } from "@/lib/file-field.schema"

// `image` carries a display URL the backend has no field for — only the file id goes on the
// wire. No `type` on the wire — this feature never changes an item's type away from RM.
const updateMaterialPayloadSchema = updateMaterialSchema.transform(
  ({ image, ...rest }) => ({
    ...rest,
    imageFileId: resolveApiFileId(image, "update"),
  })
)

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateMaterialErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "item.error.not_found":
      return "Không tìm thấy vật tư."
    case "item.error.code_exists":
      return "Mã vật tư đã tồn tại."
    case "file.error.not_found":
      return "File đính kèm không còn tồn tại. Vui lòng tải lên lại."
    case "unit.error.not_found":
      return "Đơn vị tính không tồn tại."
    case "unit.error.scope_mismatch":
      return "Đơn vị tính không dùng được cho loại này."
    case "client.error.not_found":
      return "Khách hàng không tồn tại."
    case "supplier.error.not_found":
      return "Nhà cung cấp không tồn tại."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updateMaterial = createServerFn({ method: "POST" })
  .validator(updateMaterialPayloadSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { materialId, ...payload } = data
      await http.patch(`/api/items/${materialId}`, payload)
    } catch (error) {
      logHttpError(error, "updateMaterial")

      throw new Error(resolveUpdateMaterialErrorMessage(error))
    }
  })
