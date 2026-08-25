import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { OperationDetail } from "@/lib/types/operation.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetOperationsListErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách công đoạn."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Full-detail variant for the management screen (list/create/update/delete) — distinct from
// get-operations.api.ts's `getOperations`, which is a silent-fail combobox picker returning the
// narrower `OperationRef` shape for BOM/routing steps. Both call the same `GET /api/operations`.
export const getOperationsList = createServerFn({ method: "GET" }).handler(
  async (): Promise<OperationDetail[]> => {
    try {
      const response = await http.get<OperationDetail[]>("/api/operations")

      return response.data
    } catch (error) {
      logHttpError(error, "getOperationsList")

      throw new Error(resolveGetOperationsListErrorMessage(error))
    }
  }
)
