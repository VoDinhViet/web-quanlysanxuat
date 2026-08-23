import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveApproveInventoryRequisitionErrorMessage(
  error: unknown
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "inventory_requisition.error.not_found":
      return "Không tìm thấy phiếu lãnh vật tư."
    case "inventory_requisition.error.invalid_approval_state":
      return "Phiếu đã đổi trạng thái. Vui lòng tải lại trang."
    case "inventory_requisition_item.error.quantity_exceeds_issuable":
      return "Có dòng vật tư vượt quá số lượng có thể lãnh — kiểm tra lại tồn kho."
    case "inventory_requisition_item.error.quantity_exceeds_bom_remaining":
      return "Có dòng vật tư vượt quá số lượng BOM còn lại của Job."
    case "auth.error.forbidden":
      return "Bạn không có quyền duyệt phiếu lãnh vật tư này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const approveInventoryRequisition = createServerFn({ method: "POST" })
  .validator(z.object({ requisitionId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(
        `/api/inventory-requisitions/${data.requisitionId}/approve`
      )
    } catch (error) {
      logHttpError(error, "approveInventoryRequisition")

      throw new Error(resolveApproveInventoryRequisitionErrorMessage(error))
    }
  })
