import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createDirectSchema } from "@/features/directs/schemas/create-direct.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { resolveApiFileId } from "@/lib/file-field.schema"

// `image` carries a display URL the backend has no field for — only the file id goes on the
// wire. `type` isn't a form field — this feature only ever creates DIRECT (vật tư) items, so it's
// fixed here rather than carried through the form/schema.
const createDirectPayloadSchema = createDirectSchema.transform(
  ({ image, ...rest }) => ({
    ...rest,
    type: "DIRECT" as const,
    imageFileId: resolveApiFileId(image, "create"),
  })
)

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateDirectErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "item.error.code_exists":
      return "Mã vật tư đã tồn tại."
    case "item.error.direct_code_required":
      return "Vui lòng nhập mã vật tư."
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

export const createDirect = createServerFn({ method: "POST" })
  .validator(createDirectPayloadSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post("/api/items", data)
    } catch (error) {
      logHttpError(error, "createDirect")

      throw new Error(resolveCreateDirectErrorMessage(error))
    }
  })
