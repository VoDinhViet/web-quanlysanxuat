import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import { SORT_ORDERS } from "@/lib/types/pagination.type"
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

// Broader than any single caller's own search schema — see get-clients.api.ts
// for why (route-facing `productsSearchSchema` stays local to the products
// route and doesn't expose `type`, this one does). The unified product-picker
// combobox (this feature's own BOM picker, and orders' order-line picker via
// this feature's `api` barrel) is the other caller, optionally fixing
// `type`/`status` and driving `q` from its own search box.
const getProductsSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  q: optional(z.string().trim()),
  type: z.enum(ProductType).optional(),
  clientId: z.string().trim().min(1).optional(),
  productGroupId: z.string().trim().min(1).optional(),
  status: z.enum(ProductStatus).optional(),
  order: z.enum(SORT_ORDERS).optional(),
})

export const getProducts = createServerFn({ method: "GET" })
  .validator(getProductsSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<Product>> => {
    try {
      const response = await http.get<PaginatedResponse<Product>>(
        "/api/products",
        { params: data }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getProducts")

      throw new Error(resolveGetProductsErrorMessage(error))
    }
  })
