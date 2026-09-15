import { createServerFn } from "@tanstack/react-start"

import { http, logHttpError } from "@/lib/http"
import type { PermissionCode } from "@/lib/types/permission.type"

export type PermissionCatalogueItem = {
  code: PermissionCode
  action: string
  label: string
  description?: string
}

export type PermissionCatalogueGroup = {
  resource: string
  label: string
  description?: string
  codes: PermissionCode[]
  permissions: PermissionCatalogueItem[]
}

export const getPermissionCatalogue = createServerFn({ method: "GET" })
  .handler(async (): Promise<PermissionCatalogueGroup[]> => {
    try {
      const response = await http.get<PermissionCatalogueGroup[]>(
        "/api/roles/permissions"
      )
      return response.data
    } catch (error) {
      logHttpError(error, "getPermissionCatalogue")
      return []
    }
  })
