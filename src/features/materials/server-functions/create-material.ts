import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import type { z } from "zod"

import { materialFormSchema } from "@/features/materials/schemas/material-form.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { Material } from "@/features/materials/types/material.type"

type ValidatedCreate = z.output<typeof materialFormSchema>

// `image`/`attachments` carry display URLs the backend has no field for — only
// the file ids go on the wire, so they are destructured out rather than spread.
function toCreateMaterialPayload(data: ValidatedCreate) {
  const { image, attachments, ...rest } = data

  return {
    ...rest,
    imageFileId: image?.id,
    attachmentFileIds: attachments.map((attachment) => attachment.id),
  }
}

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateMaterialErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "material.error.code_exists":
      return "Mã vật tư đã tồn tại."
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

export const createMaterial = createServerFn({ method: "POST" })
  .validator(materialFormSchema)
  .handler(async ({ data }): Promise<Material> => {
    try {
      const response = await http.post<Material>(
        "/api/materials",
        toCreateMaterialPayload(data)
      )

      return response.data
    } catch (error) {
      logHttpError(error, "createMaterial")

      throw new Error(resolveCreateMaterialErrorMessage(error))
    }
  })
