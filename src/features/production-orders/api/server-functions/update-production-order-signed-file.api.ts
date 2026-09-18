import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateProductionOrderSignedFileSchema } from "@/features/production-orders/schemas/update-production-order-signed-file.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductionOrderDetail } from "@/lib/types/production-order.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateSignedFileErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "production_order.error.not_found":
      return "Không tìm thấy lệnh sản xuất."
    case "file.error.not_found":
      return "Tệp đính kèm không tồn tại trên hệ thống."
    case "auth.error.forbidden":
      return "Bạn không có quyền sửa lệnh sản xuất này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updateProductionOrderSignedFile = createServerFn({ method: "POST" })
  .validator(updateProductionOrderSignedFileSchema)
  .handler(async ({ data }): Promise<ProductionOrderDetail> => {
    try {
      const { productionOrderId, signedFileId } = data
      const response = await http.patch<ProductionOrderDetail>(
        `/api/production-orders/${productionOrderId}/signed-file`,
        { signedFileId }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "updateProductionOrderSignedFile")

      throw new Error(resolveUpdateSignedFileErrorMessage(error))
    }
  })
