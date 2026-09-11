import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateInventoryRequisitionErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "inventory_requisition.error.not_found":
      return "Không tìm thấy phiếu lãnh vật tư."
    case "inventory_requisition.error.not_editable":
      return "Phiếu không ở trạng thái có thể chỉnh sửa (chỉ sửa khi Nháp hoặc Từ chối)."
    case "inventory_requisition.error.quantity_exceeds_issuable":
      return "Số lượng lãnh vượt quá số lượng có thể xuất kho."
    case "inventory_requisition.error.quantity_exceeds_bom":
      return "Số lượng lãnh vượt quá định mức BOM còn lại của Job."
    case "auth.error.forbidden":
      return "Bạn không có quyền chỉnh sửa phiếu lãnh vật tư này."
    default:
      return error.response?.data?.message ?? GENERIC_ERROR_MESSAGE
  }
}

export const updateInventoryRequisition = createServerFn({ method: "POST" })
  .validator(
    z.object({
      requisitionId: z.string().uuid(),
      items: z.array(
        z.object({
          itemId: z.string().uuid(),
          quantity: z.number().positive(),
          unitId: z.string().uuid().optional(),
          note: z.string().nullable().optional(),
        })
      ),
    })
  )
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.patch(`/api/inventory-requisitions/${data.requisitionId}`, {
        items: data.items,
      })
    } catch (error) {
      logHttpError(error, "updateInventoryRequisition")

      throw new Error(resolveUpdateInventoryRequisitionErrorMessage(error))
    }
  })
