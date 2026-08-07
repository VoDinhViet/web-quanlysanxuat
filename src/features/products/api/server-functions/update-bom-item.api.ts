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
      return "Số lượng phải là số nguyên đối với bán thành phẩm (WIP)."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const updateBomItemInputSchema = updateBomItemSchema.extend({
  itemId: z.uuid(),
  bomItemId: z.uuid(),
})

type UpdateBomItemInput = z.infer<typeof updateBomItemInputSchema>

function toUpdateBomItemPayload(
  data: Omit<UpdateBomItemInput, "itemId" | "bomItemId">
) {
  const note = data.note.trim()
  const sortOrder = data.sortOrder.trim()

  return {
    quantity: Number(data.quantity),
    sortOrder: sortOrder === "" ? undefined : Number(sortOrder),
    // Empty clears the note (null); a value updates it.
    note: note === "" ? null : note,
    drawingFileId: resolveApiFileId(data.drawing, "update"),
  }
}

export const updateBomItem = createServerFn({ method: "POST" })
  .validator(updateBomItemInputSchema)
  .handler(async ({ data }): Promise<BomItem> => {
    try {
      const { itemId, bomItemId, ...rest } = data
      const response = await http.patch<BomItem>(
        `/api/items/${itemId}/bom/items/${bomItemId}`,
        toUpdateBomItemPayload(rest)
      )

      return response.data
    } catch (error) {
      logHttpError(error, "updateBomItem")

      throw new Error(resolveUpdateBomItemErrorMessage(error))
    }
  })
