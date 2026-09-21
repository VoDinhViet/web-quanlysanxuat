import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { InventoryRequisitionDetail } from "@/lib/types/inventory-requisition.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetInventoryRequisitionErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "inventory_requisition.error.not_found":
      return "Không tìm thấy phiếu lãnh vật tư."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem phiếu lãnh vật tư này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getInventoryRequisition = createServerFn({ method: "GET" })
  .validator(z.object({ requisitionId: z.uuid() }))
  .handler(async ({ data }): Promise<InventoryRequisitionDetail> => {
    try {
      const response = await http.get<InventoryRequisitionDetail>(
        `/api/inventory-requisitions/${data.requisitionId}`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getInventoryRequisition")

      throw new Error(resolveGetInventoryRequisitionErrorMessage(error))
    }
  })
