import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createProductionJobNoteSchema } from "@/features/production-jobs/schemas/create-production-job-note.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateProductionJobNoteErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "production_job.error.not_found":
      return "Không tìm thấy Job."
    case "auth.error.forbidden":
      return "Bạn không có quyền thêm ghi chú cho Job này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const createProductionJobNote = createServerFn({ method: "POST" })
  .validator(createProductionJobNoteSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { productionJobId, content } = data
      await http.post(`/api/production-jobs/${productionJobId}/notes`, {
        content,
      })
    } catch (error) {
      logHttpError(error, "createProductionJobNote")

      throw new Error(resolveCreateProductionJobNoteErrorMessage(error))
    }
  })
