import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { fileFieldSchema, resolveApiFileIds } from "@/lib/file-field.schema"
import { http, logHttpError } from "@/lib/http"
import { toIsoDate } from "@/lib/zod-transforms"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateJobOperationReportErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "production_job.error.not_found":
      return "Không tìm thấy Job."
    case "production_job.error.invalid_status_transition":
      return "Chỉ có thể báo cáo khi Job đang sản xuất."
    case "production_job_operation.error.not_found":
      return "Không tìm thấy công đoạn."
    case "production_job_operation.error.completed_plus_rejected_exceeds_planned":
      return "Tổng SL hoàn thành + SL không đạt không được vượt SL kế hoạch."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Nhận `completedQuantityDelta`/`rejectedQuantityDelta` — SL cộng thêm lần này, BE tự cộng dồn
// (khoá row, an toàn hơn tự cộng ở FE rồi gửi tuyệt đối). `jobOperationId` là id của
// `production_job_operations` (route param), khác `operationId` (công đoạn danh mục) — xem
// create-job-operation-report.schema.ts.
const createJobOperationReportParamsSchema = z
  .object({
    jobOperationId: z.uuid(),
    completedQuantityDelta: z.number().min(0),
    rejectedQuantityDelta: z.number().min(0),
    completedDate: z.string().min(1).transform(toIsoDate),
    note: z.string().trim().max(500).optional(),
    images: z.array(fileFieldSchema).default([]),
  })
  .transform(({ images, ...rest }) => ({
    ...rest,
    imageFileIds: resolveApiFileIds(images),
  }))

// Nhập báo cáo hoàn thành công đoạn — POST /production-execution/operations/:jobOperationId/reports,
// khác PATCH .../operations/:operationId của tab "Công đoạn sản xuất"
// (update-production-job-operation.api.ts, ghi đè): route này cộng dồn phía server + ghi nhật ký
// từng lần báo cáo (append-only), trả `204`. Tên hàm khớp
// ProductionExecutionService.createJobOperationReport bên BE.
export const createJobOperationReport = createServerFn({ method: "POST" })
  .validator(createJobOperationReportParamsSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { jobOperationId, ...body } = data
      await http.post(
        `/api/production-execution/operations/${jobOperationId}/reports`,
        body
      )
    } catch (error) {
      logHttpError(error, "createJobOperationReport")

      throw new Error(resolveCreateJobOperationReportErrorMessage(error))
    }
  })
