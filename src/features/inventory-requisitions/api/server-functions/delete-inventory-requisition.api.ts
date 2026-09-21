import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveDeleteInventoryRequisitionErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "inventory_requisition.error.not_found":
      return "Không tìm thấy phiếu lãnh vật tư."
    case "inventory_requisition.error.not_editable":
      return "Chỉ có thể xoá phiếu lãnh vật tư ở trạng thái Nháp."
    case "auth.error.forbidden":
      return "Bạn không có quyền xoá phiếu lãnh vật tư này."
    default:
      return error.response?.data?.message ?? GENERIC_ERROR_MESSAGE
  }
}

export const deleteInventoryRequisition = createServerFn({ method: "POST" })
  .validator(z.object({ requisitionId: z.string().uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.delete(`/api/inventory-requisitions/${data.requisitionId}`)
    } catch (error) {
      logHttpError(error, "deleteInventoryRequisition")

      throw new Error(resolveDeleteInventoryRequisitionErrorMessage(error))
    }
  })
