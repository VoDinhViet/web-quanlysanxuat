import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateConsumableSchema } from "@/features/consumables/schemas/update-consumable.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { resolveApiFileId } from "@/lib/file-field.schema"

// `image` carries a display URL the backend has no field for — only the file id goes on the
// wire. No `type` on the wire — this feature never changes an item's type away from CONSUMABLE.
const updateConsumablePayloadSchema = updateConsumableSchema.transform(
  ({ image, ...rest }) => ({
    ...rest,
    imageFileId: resolveApiFileId(image, "update"),
  })
)

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateConsumableErrorMessage(error: unknown): string {
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

export const updateConsumable = createServerFn({ method: "POST" })
  .validator(updateConsumablePayloadSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { consumableId, ...payload } = data
      await http.patch(`/api/items/${consumableId}`, payload)
    } catch (error) {
      logHttpError(error, "updateConsumable")

      throw new Error(resolveUpdateConsumableErrorMessage(error))
    }
  })
