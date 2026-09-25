import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateDirectSchema } from "@/features/directs/schemas/update-direct.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { resolveApiFileId } from "@/lib/file-field.schema"

// `image` carries a display URL the backend has no field for — only the file id goes on the
// wire. No `type` on the wire — this feature never changes an item's type away from DIRECT.
const updateDirectPayloadSchema = updateDirectSchema.transform(
  ({ image, ...rest }) => ({
    ...rest,
    imageFileId: resolveApiFileId(image, "update"),
  })
)

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateDirectErrorMessage(error: unknown): string {
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

export const updateDirect = createServerFn({ method: "POST" })
  .validator(updateDirectPayloadSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { directId, ...payload } = data
      await http.patch(`/api/items/${directId}`, payload)
    } catch (error) {
      logHttpError(error, "updateDirect")

      throw new Error(resolveUpdateDirectErrorMessage(error))
    }
  })
