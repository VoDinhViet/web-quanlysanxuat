import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PermissionCode } from "@/lib/types/permission.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

export type PermissionCatalogueItem = {
  code: PermissionCode
  action: string
  label: string
  description?: string
}

export type PermissionCatalogueGroup = {
  resource: string
  /** Business block key this resource belongs to, e.g. "warehouse" — the backend already
   *  orders groups by block, so the matrix only needs to bucket consecutive rows sharing it. */
  block: string
  blockLabel: string
  label: string
  description?: string
  codes: PermissionCode[]
  permissions: PermissionCatalogueItem[]
}

function resolveGetPermissionCatalogueErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh mục quyền hạn."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getPermissionCatalogue = createServerFn({
  method: "GET",
}).handler(async (): Promise<PermissionCatalogueGroup[]> => {
  try {
    const response = await http.get<PermissionCatalogueGroup[]>(
      "/api/roles/permissions"
    )
    return response.data
  } catch (error) {
    logHttpError(error, "getPermissionCatalogue")
    throw new Error(resolveGetPermissionCatalogueErrorMessage(error))
  }
})
