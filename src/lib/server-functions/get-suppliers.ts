import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import { SORT_ORDERS } from "@/lib/types/pagination.type"
import { SupplierStatus } from "@/lib/types/supplier.type"
import type { Supplier } from "@/lib/types/supplier.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetSuppliersErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Broader than any single caller's own search schema — see get-clients.ts for
// why (route-facing `suppliersSearchSchema` stays local to the suppliers
// route, this one just needs to be wire-valid for the backend).
const getSuppliersSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  q: z.string().trim().min(1).optional(),
  status: z.enum(SupplierStatus).optional(),
  supplierGroupId: z.string().trim().min(1).optional(),
  countryId: z.string().trim().min(1).optional(),
  order: z.enum(SORT_ORDERS).optional(),
})

export const getSuppliers = createServerFn({ method: "GET" })
  .validator(getSuppliersSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<Supplier>> => {
    try {
      const response = await http.get<PaginatedResponse<Supplier>>(
        "/api/suppliers",
        { params: data }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getSuppliers")

      throw new Error(resolveGetSuppliersErrorMessage(error))
    }
  })
