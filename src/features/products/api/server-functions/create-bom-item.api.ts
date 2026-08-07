import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { createBomItemSchema } from "@/features/products/schemas/create-bom-item.schema"
import { resolveApiFileId } from "@/lib/file-field.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { BomItem } from "@/lib/types/bom-item.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateBomItemErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "item.error.not_found":
      return "Không tìm thấy sản phẩm."
    case "bom_item.error.parent_not_found":
      return "Không tìm thấy hạng mục cha."
    case "bom_item.error.parent_is_leaf":
      return "Vật tư luôn là lá của cấu trúc — không thể thêm hạng mục con vào đây."
    case "bom_item.error.item_not_wip":
      return "Chỉ thêm được bán thành phẩm (WIP) hoặc vật tư (RM) vào cấu trúc."
    case "bom_item.error.cycle_detected":
      return "Không thể thêm: sẽ tạo vòng lặp trong cấu trúc sản phẩm."
    case "bom_item.error.quantity_not_integer":
      return "Số lượng phải là số nguyên đối với bán thành phẩm (WIP)."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// `rootItemId` (not `itemId`) — the schema already has its own `itemId` (the
// linked WIP/RM node, see create-bom-item.schema.ts); this one is the FG/WIP
// item whose BOM tree the new node is added to. Different entities, so they
// can't share a name once the two schemas are merged here.
const createBomItemInputSchema = createBomItemSchema.extend({
  rootItemId: z.uuid(),
  parentId: z.uuid().nullable(),
  sortOrder: z.number().int().min(0).optional(),
})

type CreateBomItemInput = z.infer<typeof createBomItemInputSchema>

function toCreateBomItemPayload(data: Omit<CreateBomItemInput, "rootItemId">) {
  const note = data.note.trim()

  return {
    itemId: data.itemId,
    parentId: data.parentId,
    quantity: Number(data.quantity),
    sortOrder: data.sortOrder,
    note: note === "" ? undefined : note,
    drawingFileId: resolveApiFileId(data.drawing, "create"),
  }
}

export const createBomItem = createServerFn({ method: "POST" })
  .validator(createBomItemInputSchema)
  .handler(async ({ data }): Promise<BomItem> => {
    try {
      const { rootItemId, ...rest } = data
      const response = await http.post<BomItem>(
        `/api/items/${rootItemId}/bom/items`,
        toCreateBomItemPayload(rest)
      )

      return response.data
    } catch (error) {
      logHttpError(error, "createBomItem")

      throw new Error(resolveCreateBomItemErrorMessage(error))
    }
  })
