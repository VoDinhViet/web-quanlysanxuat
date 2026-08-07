import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import { ProductStatus, ProductType } from "@/lib/types/product.type"
import type { Product } from "@/lib/types/product.type"
import { optional } from "@/lib/zod-transforms"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const getProductsSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  q: optional(z.string().trim()),
  type: z.enum(ProductType).optional(),
  clientId: z.string().trim().min(1).optional(),
  status: z.enum(ProductStatus).optional(),
  order: z.enum(["ASC", "DESC"]).optional(),
})

// The backend's `GET /api/items` `type` filter takes an array (comma-separated on the wire) so
// it can express "FG or WIP" in one call — this feature's own filter stays a single optional
// value (see products-search.schema.ts), defaulting to both FG and WIP so RM never leaks into
// the products list.
export const getProducts = createServerFn({ method: "GET" })
  .validator(getProductsSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<Product>> => {
    try {
      const { type, ...rest } = data
      const response = await http.get<PaginatedResponse<Product>>(
        "/api/items",
        {
          params: {
            ...rest,
            type: (type ? [type] : [ProductType.FG, ProductType.WIP]).join(","),
          },
        }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getProducts")

      throw new Error(resolveGetProductsErrorMessage(error))
    }
  })
