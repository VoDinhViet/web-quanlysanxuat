import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createInventoryRequisitionSchema } from "@/features/inventory-requisitions/schemas/create-inventory-requisition.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

// Strip the UI-only `line` snapshot each item carries (picker's "6 numbers", read on the client
// by inventoryRequisitionItemFormSchema's own .refine to pre-empt E231/E232) — the only "mapping"
// this create flow does, kept in the validator per architecture.md's wire-payload-mapping rule.
const createInventoryRequisitionPayloadSchema =
  createInventoryRequisitionSchema.transform(({ items, ...requisition }) => ({
    ...requisition,
    items: items.map(({ line: _line, ...item }) => item),
  }))

function resolveCreateInventoryRequisitionErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "inventory_requisition.error.production_job_required":
      return "Vui lòng chọn Job cần lãnh vật tư."
    case "inventory_requisition_item.error.duplicate_item":
      return "Có vật tư bị chọn trùng lặp trong phiếu."
    case "item.error.not_found":
      return "Có vật tư không tồn tại hoặc đã bị xoá."
    case "inventory_requisition_item.error.item_not_raw_material":
      return "Chỉ được lãnh vật tư nguyên liệu (RM)."
    case "inventory_requisition_item.error.not_in_job_bom":
      return "Có vật tư không nằm trong định mức BOM của Job."
    case "inventory_requisition_item.error.quantity_exceeds_issuable":
      return "Có dòng có SL lãnh vượt SL có thể lãnh."
    case "inventory_requisition_item.error.quantity_exceeds_bom_remaining":
      return "Có dòng có SL lãnh vượt SL BOM còn lại."
    case "auth.error.forbidden":
      return "Bạn không có quyền tạo phiếu lãnh vật tư."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Luôn tạo ở DRAFT, không đụng tồn kho — gửi duyệt là một hành động riêng
// (sendInventoryRequisition). Backend trả 204, không có id để điều hướng thẳng vào chi tiết.
export const createInventoryRequisition = createServerFn({ method: "POST" })
  .validator(createInventoryRequisitionPayloadSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post("/api/inventory-requisitions", data)
    } catch (error) {
      logHttpError(error, "createInventoryRequisition")

      throw new Error(resolveCreateInventoryRequisitionErrorMessage(error))
    }
  })
