import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import { SORT_ORDERS } from "@/lib/types/pagination.type"
import { ProductStatus, ProductType } from "@/lib/types/product.type"
import type { Product } from "@/lib/types/product.type"

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

// Broader than any single caller's own search schema — see get-clients.ts for
// why (route-facing `productsSearchSchema` stays local to the products route
// and doesn't expose `type`, this one does). The products feature's own BOM
// product picker is the other caller, fixing `type: WORK_IN_PROGRESS` and
// `status: ACTIVE`, driving `q` from the picker's search box.
const getProductsSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  q: z.string().trim().min(1).optional(),
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
