import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { MaterialStatus, MaterialType } from "@/lib/types/material.type"
import type { Material } from "@/lib/types/material.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import { optional } from "@/lib/zod-transforms"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetMaterialsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Broader than any single caller's own search schema — see get-clients.api.ts
// for why (route-facing `materialsSearchSchema` stays local to the materials
// route, this one just needs to be wire-valid for the backend). The products
// feature's BOM material picker is the other caller (via this feature's `api`
// barrel), fixing `status: ACTIVE` and driving `q` from the picker's search box.
const getMaterialsSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  q: optional(z.string().trim()),
  type: z.enum(MaterialType).optional(),
  materialGroupId: z.string().trim().min(1).optional(),
  clientId: z.string().trim().min(1).optional(),
  status: z.enum(MaterialStatus).optional(),
  order: z.enum(["ASC", "DESC"]).optional(),
})

export const getMaterials = createServerFn({ method: "GET" })
  .validator(getMaterialsSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<Material>> => {
    try {
      const response = await http.get<PaginatedResponse<Material>>(
        "/api/materials",
        { params: data }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getMaterials")

      throw new Error(resolveGetMaterialsErrorMessage(error))
    }
  })
