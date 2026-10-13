import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { ncrsSearchSchema } from "@/features/ncrs/schemas/ncrs-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { Ncr } from "@/lib/types/ncr.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetNcrsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách NCR."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getNcrs = createServerFn({ method: "GET" })
  .validator(ncrsSearchSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<Ncr>> => {
    try {
      const response = await http.get<PaginatedResponse<Ncr>>("/api/ncrs", {
        params: data,
      })

      return response.data
    } catch (error) {
      logHttpError(error, "getNcrs")

      throw new Error(resolveGetNcrsErrorMessage(error))
    }
  })
