import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { FileResource } from "@/lib/types/file.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductionJobAttachmentsErrorMessage(
  error: unknown
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "production_job.error.not_found":
      return "Không tìm thấy Job."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem tài liệu của Job này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Job has no attachment table of its own — the backend reads through the FG product's
// documents, so this is a flat array (not the nested `{id, file}` join shape other entities'
// attachments use) and there is no upload/delete route at the Job level.
export const getProductionJobAttachments = createServerFn({ method: "GET" })
  .validator(z.object({ productionJobId: z.uuid() }))
  .handler(async ({ data }): Promise<FileResource[]> => {
    try {
      const response = await http.get<FileResource[]>(
        `/api/production-jobs/${data.productionJobId}/attachments`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getProductionJobAttachments")

      throw new Error(resolveGetProductionJobAttachmentsErrorMessage(error))
    }
  })
