import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateClientSchema } from "@/features/clients/schemas/update-client.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { Client } from "@/lib/types/client.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateClientErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "client.error.not_found":
      return "Không tìm thấy khách hàng."
    case "client.error.code_exists":
      return "Mã khách hàng đã tồn tại."
    case "client.error.tax_code_exists":
      return "Mã số thuế đã tồn tại."
    case "client_group.error.not_found":
      return "Nhóm khách hàng không tồn tại."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updateClient = createServerFn({ method: "POST" })
  .validator(updateClientSchema)
  .handler(async ({ data }): Promise<Client> => {
    try {
      const { clientId, ...payload } = data
      const response = await http.patch<Client>(
        `/api/clients/${clientId}`,
        payload
      )

      return response.data
    } catch (error) {
      logHttpError(error, "updateClient")

      throw new Error(resolveUpdateClientErrorMessage(error))
    }
  })
