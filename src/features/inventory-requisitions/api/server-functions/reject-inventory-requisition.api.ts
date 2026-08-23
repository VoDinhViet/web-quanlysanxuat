import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { rejectInventoryRequisitionSchema } from "@/features/inventory-requisitions/schemas/reject-inventory-requisition.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveRejectInventoryRequisitionErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "inventory_requisition.error.not_found":
      return "Không tìm thấy phiếu lãnh vật tư."
    case "inventory_requisition.error.invalid_approval_state":
      return "Phiếu đã đổi trạng thái. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền từ chối phiếu lãnh vật tư này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const rejectInventoryRequisition = createServerFn({ method: "POST" })
  .validator(rejectInventoryRequisitionSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(
        `/api/inventory-requisitions/${data.requisitionId}/reject`,
        { reason: data.reason }
      )
    } catch (error) {
      logHttpError(error, "rejectInventoryRequisition")

      throw new Error(resolveRejectInventoryRequisitionErrorMessage(error))
    }
  })
