import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type {
  Product,
  ProductFilterOption,
  ProductStats,
} from "@/features/products/types/product.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductStatsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// The backend has no /products/stats endpoint, so each tile is a filtered count
// query with limit=1 — the list endpoint always returns the full filtered
// `totalRecords` alongside the (single) page of rows.
async function countProducts(params: Record<string, string>): Promise<number> {
  const response = await http.get<PaginatedResponse<Product>>("/api/products", {
    params: { ...params, page: 1, limit: 1 },
  })

  return response.data.pagination.totalRecords
}

async function countProductGroups(): Promise<number> {
  const response = await http.get<PaginatedResponse<ProductFilterOption>>(
    "/api/product-groups",
    { params: { page: 1, limit: 1 } }
  )

  return response.data.pagination.totalRecords
}

export const getProductStats = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProductStats> => {
    try {
      const [total, active, groupCount] = await Promise.all([
        countProducts({}),
        countProducts({ status: "ACTIVE" }),
        countProductGroups(),
      ])

      return { total, active, inactive: total - active, groupCount }
    } catch (error) {
      logHttpError(error, "getProductStats")

      throw new Error(resolveGetProductStatsErrorMessage(error))
    }
  }
)
