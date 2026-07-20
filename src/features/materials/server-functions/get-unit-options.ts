import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { MaterialRef } from "@/features/materials/types/material.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetFilterOptionsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getUnitOptions = createServerFn({ method: "GET" }).handler(
  async (): Promise<MaterialRef[]> => {
    try {
      // `scope` is required as of 2026-07-20: omitting it returns every unit,
      // and create/update materials then reject an out-of-scope one with
      // unit.error.scope_mismatch — so filter at the source and never offer a
      // choice the backend will refuse.
      //
      // Unlike the other reference lists, /units is not paginated: it returns a
      // bare array, so there is no envelope to unwrap and no `limit` to cap.
      const response = await http.get<MaterialRef[]>("/api/units", {
        params: { scope: "MATERIAL" },
      })

      return response.data
    } catch (error) {
      logHttpError(error, "getUnitOptions")

      throw new Error(resolveGetFilterOptionsErrorMessage(error))
    }
  }
)
