import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { NcrOperation } from "@/lib/types/ncr.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetNcrOperationsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "ncr.error.not_found":
      return "Không tìm thấy NCR."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem NCR này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getNcrOperations = createServerFn({ method: "GET" })
  .validator(z.object({ ncrId: z.uuid() }))
  .handler(async ({ data }): Promise<NcrOperation[]> => {
    try {
      const response = await http.get<NcrOperation[]>(
        `/api/ncrs/${data.ncrId}/operations`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getNcrOperations")

      throw new Error(resolveGetNcrOperationsErrorMessage(error))
    }
  })
