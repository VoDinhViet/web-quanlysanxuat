import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { Client } from "@/lib/types/client.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetClientErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "client.error.not_found":
      return "Không tìm thấy khách hàng."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getClient = createServerFn({ method: "GET" })
  .validator(z.object({ clientId: z.uuid() }))
  .handler(async ({ data }): Promise<Client> => {
    try {
      const response = await http.get<Client>(`/api/clients/${data.clientId}`)

      return response.data
    } catch (error) {
      logHttpError(error, "getClient")

      throw new Error(resolveGetClientErrorMessage(error))
    }
  })
