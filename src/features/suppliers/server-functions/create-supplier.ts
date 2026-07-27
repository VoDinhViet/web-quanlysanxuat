import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { buildRepresentativesPayload } from "@/features/suppliers/schemas/supplier-form.schema"
import { createSupplierSchema } from "@/features/suppliers/schemas/create-supplier.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import {
  resolveAttachmentFileIds,
  resolveFileFieldId,
} from "@/lib/file-field.schema"
import type { Supplier } from "@/lib/types/supplier.type"

// `logo`/`attachments` carry display URLs the backend has no field for — only
// the file ids go on the wire, so they are destructured out rather than
// spread. `representativeName`/`representativePhone` are the form's flat
// fields for what the backend models as a `representatives[]` array.
const createSupplierPayloadSchema = createSupplierSchema.transform(
  ({
    logo,
    attachments,
    representativeName,
    representativePhone,
    ...rest
  }) => ({
    ...rest,
    logoFileId: resolveFileFieldId(logo, "create"),
    attachmentFileIds: resolveAttachmentFileIds(attachments),
    representatives: buildRepresentativesPayload(
      representativeName,
      representativePhone
    ),
  })
)

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
  .validator(createSupplierPayloadSchema)
  .handler(async ({ data }): Promise<Supplier> => {
    try {
      const response = await http.post<Supplier>("/api/suppliers", data)

      return response.data
    } catch (error) {
      logHttpError(error, "createSupplier")

      throw new Error(resolveCreateSupplierErrorMessage(error))
    }
  })
