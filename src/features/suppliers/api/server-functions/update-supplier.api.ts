import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateSupplierSchema } from "@/features/suppliers/schemas/update-supplier.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { resolveApiFileId, resolveApiFileIds } from "@/lib/file-field.schema"
import type { Supplier } from "@/lib/types/supplier.type"

type SupplierRepresentativePayload = {
  name: string
  phoneNumber?: string
  isPrimary: boolean
}

// The form only exposes one flat representative (name + phone) — mapped here to the backend's
// `representatives[]` shape. An empty name means "no representative", mapped to `[]` rather than
// omitted: the backend replaces the full representatives list, so an empty array is itself a
// meaningful "no representatives" payload, not a no-op.
function buildRepresentativesPayload(
  name?: string,
  phoneNumber?: string
): SupplierRepresentativePayload[] {
  return name ? [{ name, phoneNumber, isPrimary: true }] : []
}

// `logo`/`files` carry display URLs the backend has no field for — only the file ids go
// on the wire. `updateSupplierSchema` already leaves every other field wire-ready
// (emptyToNull-transformed), so this only maps file ids and folds the flat representative
// fields into `representatives[]`.
const updateSupplierPayloadSchema = updateSupplierSchema.transform(
  ({ logo, files, representativeName, representativePhone, ...rest }) => ({
    ...rest,
    logoFileId: resolveApiFileId(logo, "update"),
    fileIds: resolveApiFileIds(files),
    representatives: buildRepresentativesPayload(
      representativeName,
      representativePhone
    ),
  })
)

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateSupplierErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "supplier.error.tax_code_exists":
      return "Mã số thuế đã tồn tại."
    case "supplier.error.code_exists":
      return "Mã nhà cung cấp đã tồn tại."
    case "supplier.error.not_found":
      return "Không tìm thấy nhà cung cấp."
    case "file.error.not_found":
      return "File đính kèm không còn tồn tại. Vui lòng tải lên lại."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updateSupplier = createServerFn({ method: "POST" })
  .validator(updateSupplierPayloadSchema)
  .handler(async ({ data }): Promise<Supplier> => {
    try {
      const { supplierId, ...payload } = data
      const response = await http.patch<Supplier>(
        `/api/suppliers/${supplierId}`,
        payload
      )

      return response.data
    } catch (error) {
      logHttpError(error, "updateSupplier")

      throw new Error(resolveUpdateSupplierErrorMessage(error))
    }
  })
