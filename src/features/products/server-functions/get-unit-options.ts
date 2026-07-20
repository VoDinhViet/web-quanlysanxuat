import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductFilterOption } from "@/features/products/types/product.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetUnitOptionsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getUnitOptions = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProductFilterOption[]> => {
    try {
      // `scope` is required as of 2026-07-20: omitting it returns every unit,
      // and create/update products then reject an out-of-scope one with
      // unit.error.scope_mismatch — so filter at the source and never offer a
      // choice the backend will refuse.
      //
      // Unlike the other reference lists, /units is not paginated: it returns a
      // bare array, so there is no envelope to unwrap and no `limit` to cap.
      const response = await http.get<ProductFilterOption[]>("/api/units", {
        params: { scope: "PRODUCT" },
      })

      return response.data
    } catch (error) {
      logHttpError(error, "getUnitOptions")

      throw new Error(resolveGetUnitOptionsErrorMessage(error))
    }
  }
)
