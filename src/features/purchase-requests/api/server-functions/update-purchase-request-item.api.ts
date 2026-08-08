import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdatePurchaseRequestItemErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_request.error.not_found":
      return "Không tìm thấy đề xuất mua hàng."
    case "purchase_request_item.error.not_found":
      return "Không tìm thấy dòng vật tư này."
    case "purchase_request.error.not_editable":
      return "Chỉ có thể sửa khi đề xuất đang ở trạng thái Nháp."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Shared by both the SL đề xuất cell (sends only `quantity`) and the note dialog (sends only
// `note`) — the wire DTO accepts either/both, so one server function covers both call sites.
// `.refine()` rejects an all-undefined body before it reaches the backend: `PATCH` with `{}`
// hits a drizzle `set({})` 500 there (known bug, not something FE can fix), so every call must
// carry at least one field.
export const updatePurchaseRequestItem = createServerFn({ method: "POST" })
  .validator(
    z
      .object({
        purchaseRequestId: z.uuid(),
        purchaseRequestItemId: z.uuid(),
        quantity: z.number().positive().optional(),
        note: z.string().trim().min(1).max(500).nullable().optional(),
      })
      .refine(
        ({ quantity, note }) => quantity !== undefined || note !== undefined,
        "Không có thay đổi nào để lưu."
      )
  )
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.patch(
        `/api/purchase-requests/${data.purchaseRequestId}/items/${data.purchaseRequestItemId}`,
        { quantity: data.quantity, note: data.note }
      )
    } catch (error) {
      logHttpError(error, "updatePurchaseRequestItem")

      throw new Error(resolveUpdatePurchaseRequestItemErrorMessage(error))
    }
  })
