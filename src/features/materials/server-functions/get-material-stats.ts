import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type {
  Material,
  MaterialStats,
} from "@/features/materials/types/material.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetMaterialStatsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// The backend has no /materials/stats endpoint, so each tile is a filtered
// count query with limit=1 — the list endpoint always returns the full
// filtered `totalRecords` alongside the (single) page of rows.
async function countMaterials(params: Record<string, string>): Promise<number> {
  const response = await http.get<PaginatedResponse<Material>>(
    "/api/materials",
    { params: { ...params, page: 1, limit: 1 } }
  )

  return response.data.pagination.totalRecords
}

export const getMaterialStats = createServerFn({ method: "GET" }).handler(
  async (): Promise<MaterialStats> => {
    try {
      const [total, active, internal, client] = await Promise.all([
        countMaterials({}),
        countMaterials({ status: "ACTIVE" }),
        countMaterials({ type: "INTERNAL" }),
        countMaterials({ type: "CLIENT" }),
      ])

      return { total, active, inactive: total - active, internal, client }
    } catch (error) {
      logHttpError(error, "getMaterialStats")

      throw new Error(resolveGetMaterialStatsErrorMessage(error))
    }
  }
)
