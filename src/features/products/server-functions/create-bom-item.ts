import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { createBomItemSchema } from "@/features/products/schemas/create-bom-item.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { BomItemNode } from "@/features/products/types/bom-item.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateBomItemErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "product.error.not_found":
      return "Không tìm thấy sản phẩm."
    case "material.error.not_found":
      return "Không tìm thấy vật tư."
    case "bom_item.error.parent_not_found":
      return "Không tìm thấy hạng mục cha."
    case "bom_item.error.parent_is_material":
      return "Không thể thêm hạng mục con vào một vật tư."
    case "bom_item.error.product_not_wip":
      return "Chỉ thêm được sản phẩm dạng bán thành phẩm (WIP) vào cấu trúc."
    case "bom_item.error.cycle_detected":
      return "Không thể thêm: sẽ tạo vòng lặp trong cấu trúc sản phẩm."
    case "bom_item.error.quantity_not_integer":
      return "Sản phẩm phải có số lượng nguyên."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const createBomItemInputSchema = createBomItemSchema.extend({
  productId: z.uuid(),
  parentId: z.uuid().nullable(),
  sortOrder: z.number().int().min(0).optional(),
})

type CreateBomItemInput = z.infer<typeof createBomItemInputSchema>

function toCreateBomItemPayload(data: Omit<CreateBomItemInput, "productId">) {
  const note = data.note.trim()

  return {
    itemType: data.itemType,
    itemId: data.itemId,
    parentId: data.parentId,
    quantity: Number(data.quantity),
    sortOrder: data.sortOrder,
    note: note === "" ? undefined : note,
  }
}

export const createBomItem = createServerFn({ method: "POST" })
  .validator(createBomItemInputSchema)
  .handler(async ({ data }): Promise<BomItemNode> => {
    try {
      const { productId, ...rest } = data
      const response = await http.post<BomItemNode>(
        `/api/products/${productId}/bom/items`,
        toCreateBomItemPayload(rest)
      )

      return response.data
    } catch (error) {
      logHttpError(error, "createBomItem")

      throw new Error(resolveCreateBomItemErrorMessage(error))
    }
  })
