import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { buildRepresentativesPayload } from "@/features/suppliers/schemas/supplier-form.schema"
import { updateSupplierSchema } from "@/features/suppliers/schemas/update-supplier.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import {
  resolveAttachmentFileIds,
  resolveFileFieldId,
} from "@/lib/file-field.schema"
import type { Supplier } from "@/lib/types/supplier.type"

// Same id-only + representatives mapping as create. On PATCH a missing key
// means "no change", so a cleared logo is sent as null — and so is every
// other optional field the shared form schema can blank out. The update form
// always resubmits every field's current value (it's not a partial diff), so
// a blank optional field always means "the user cleared it": the shared
// schema's emptyToUndefined transform (built for create's "omit = not
// provided" semantics) would otherwise leave the old value untouched.
const updateSupplierPayloadSchema = updateSupplierSchema.transform(
  ({
    logo,
    attachments,
    representativeName,
    representativePhone,
    email,
    note,
    countryId,
    internalNote,
    payment,
    ...rest
  }) => ({
    ...rest,
    logoFileId: resolveFileFieldId(logo, "update"),
    attachmentFileIds: resolveAttachmentFileIds(attachments),
    representatives: buildRepresentativesPayload(
      representativeName,
      representativePhone
    ),
    email: email ?? null,
    note: note ?? null,
    countryId: countryId ?? null,
    internalNote: internalNote ?? null,
    payment: {
      bankName: payment.bankName ?? null,
      bankAccountNumber: payment.bankAccountNumber ?? null,
      bankAccountHolder: payment.bankAccountHolder ?? null,
      bankBranch: payment.bankBranch ?? null,
      defaultPaymentMethod: payment.defaultPaymentMethod ?? null,
      defaultPaymentTerm: payment.defaultPaymentTerm ?? null,
      creditLimit: payment.creditLimit ?? null,
      creditLimitStartDate: payment.creditLimitStartDate ?? null,
    },
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
