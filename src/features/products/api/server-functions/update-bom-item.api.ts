import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { updateBomItemSchema } from "@/features/products/schemas/update-bom-item.schema"
import { resolveApiFileId } from "@/lib/file-field.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { BomItem } from "@/lib/types/bom-item.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateBomItemErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "bom_item.error.not_found":
      return "Không tìm thấy hạng mục."
    case "bom_item.error.quantity_not_integer":
      return "Số lượng phải là số nguyên đối với cấu trúc con."
    case "bom_item.error.invalid_node_payload":
      return "Không sửa được mã/tên trên vật tư — hai trường này chỉ áp dụng cho cấu trúc con."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const updateBomItemInputSchema = updateBomItemSchema.extend({
  itemId: z.uuid(),
  bomItemId: z.uuid(),
})

// `drawing` carries a display URL the backend has no field for — only the file id goes on the
// wire. Empty note clears the field (null); PATCH treats a missing key as "leave unchanged".
const updateBomItemPayloadSchema = updateBomItemInputSchema.transform(
  ({ note, drawing, ...rest }) => {
    const trimmedNote = note.trim()

    return {
      ...rest,
      note: trimmedNote === "" ? null : trimmedNote,
      drawingFileId: resolveApiFileId(drawing, "update"),
    }
  }
)

export const updateBomItem = createServerFn({ method: "POST" })
  .validator(updateBomItemPayloadSchema)
  .handler(async ({ data }): Promise<BomItem> => {
    try {
      const { itemId, bomItemId, ...payload } = data
      const response = await http.patch<BomItem>(
        `/api/items/${itemId}/bom/items/${bomItemId}`,
        payload
      )

      return response.data
    } catch (error) {
      logHttpError(error, "updateBomItem")

      throw new Error(resolveUpdateBomItemErrorMessage(error))
    }
  })
