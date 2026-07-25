import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { BomMaterial } from "@/lib/types/bom-item.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetBomMaterialsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "product.error.not_found":
      return "Không tìm thấy sản phẩm."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const getBomMaterialsSchema = z.object({
  productId: z.uuid(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  q: z.string().trim().min(1).optional(),
})

export const getBomMaterials = createServerFn({ method: "GET" })
  .validator(getBomMaterialsSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<BomMaterial>> => {
    try {
      const { productId, ...params } = data
      const response = await http.get<PaginatedResponse<BomMaterial>>(
        `/api/products/${productId}/bom/materials`,
        { params }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getBomMaterials")

      throw new Error(resolveGetBomMaterialsErrorMessage(error))
    }
  })
