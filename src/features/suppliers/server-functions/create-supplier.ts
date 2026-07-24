import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import type { z } from "zod"

import { supplierFormSchema } from "@/features/suppliers/schemas/supplier-form.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { Supplier } from "@/features/suppliers/types/supplier.type"

type ValidatedCreate = z.output<typeof supplierFormSchema>

// `logo`/`attachments` carry display URLs the backend has no field for — only
// the file ids go on the wire, so they are destructured out rather than spread.
function toCreateSupplierPayload(data: ValidatedCreate) {
  const { logo, attachments, ...rest } = data

  return {
    ...rest,
    logoFileId: logo?.id,
    attachmentFileIds: attachments.map((attachment) => attachment.id),
  }
}

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateSupplierErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "supplier.error.tax_code_exists":
      return "Mã số thuế đã tồn tại."
    case "supplier.error.code_exists":
      return "Mã nhà cung cấp đã tồn tại."
    case "file.error.not_found":
      return "File đính kèm không còn tồn tại. Vui lòng tải lên lại."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const createSupplier = createServerFn({ method: "POST" })
  .validator(supplierFormSchema)
  .handler(async ({ data }): Promise<Supplier> => {
    try {
      const response = await http.post<Supplier>(
        "/api/suppliers",
        toCreateSupplierPayload(data)
      )

      return response.data
    } catch (error) {
      logHttpError(error, "createSupplier")

      throw new Error(resolveCreateSupplierErrorMessage(error))
    }
  })
