import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import {
  createComponentItemSchema,
  createConsumableItemSchema,
} from "@/features/products/schemas/create-bom-item.schema"
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
    case "bom_item.error.item_not_consumable":
      return "Vật tư đã chọn không phải là vật tư (CONSUMABLE) hợp lệ."
    case "bom_item.error.invalid_node_payload":
      return "Dữ liệu hạng mục không hợp lệ."
    case "bom_item.error.quantity_not_integer":
      return "Số lượng phải là số nguyên đối với cấu trúc con."
    case "file.error.not_found":
      return "Ảnh đã tải lên không còn tồn tại, vui lòng tải lại."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// `rootItemId` (not `itemId`) — the CONSUMABLE branch of the schema already has its own `itemId` (the
// linked vật tư item, see create-bom-item.schema.ts); this one is the FG item whose BOM tree
// the new item is added to. Different entities, so they can't share a name once the two
// schemas are merged here.
const bomItemRootFieldsSchema = z.object({
  rootItemId: z.uuid(),
  parentId: z.uuid().nullable(),
  sortOrder: z.number().int().min(0).optional(),
})

const createBomItemInputSchema = z.discriminatedUnion("type", [
  createComponentItemSchema.extend(bomItemRootFieldsSchema.shape),
  createConsumableItemSchema.extend(bomItemRootFieldsSchema.shape),
])

// Empty note trims to `undefined` (POST — an omitted key means "not provided"). `image` (nhánh
// COMPONENT) mang URL hiển thị mà backend không có field — chỉ id lên dây dưới tên `imageFileId`.
const createBomItemPayloadSchema = createBomItemInputSchema.transform(
  ({ note, ...rest }) => {
    const trimmedNote = note.trim()
    const wireNote = trimmedNote === "" ? undefined : trimmedNote

    if (rest.type === "COMPONENT") {
      const { image, ...component } = rest

      return {
        ...component,
        note: wireNote,
        imageFileId: resolveApiFileId(image, "create"),
      }
    }

    return { ...rest, note: wireNote }
  }
)

export const createBomItem = createServerFn({ method: "POST" })
  .validator(createBomItemPayloadSchema)
  .handler(async ({ data }): Promise<BomItem> => {
    try {
      const { rootItemId, ...payload } = data
      const response = await http.post<BomItem>(
        `/api/items/${rootItemId}/bom/items`,
        payload
      )

      return response.data
    } catch (error) {
      logHttpError(error, "createBomItem")

      throw new Error(resolveCreateBomItemErrorMessage(error))
    }
  })
