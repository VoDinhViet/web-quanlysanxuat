import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveSendInventoryRequisitionErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "inventory_requisition.error.not_found":
      return "Không tìm thấy phiếu lãnh vật tư."
    case "inventory_requisition.error.not_editable":
      return "Phiếu không ở trạng thái Nháp/Từ chối nên không gửi duyệt được."
    case "auth.error.forbidden":
      return "Bạn không có quyền gửi duyệt phiếu lãnh vật tư này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const sendInventoryRequisition = createServerFn({ method: "POST" })
  .validator(z.object({ requisitionId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/inventory-requisitions/${data.requisitionId}/send`)
    } catch (error) {
      logHttpError(error, "sendInventoryRequisition")

      throw new Error(resolveSendInventoryRequisitionErrorMessage(error))
    }
  })
