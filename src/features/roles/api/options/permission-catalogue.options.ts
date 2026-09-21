import { queryOptions } from "@tanstack/react-query"

import { getPermissionCatalogue } from "../server-functions/get-permission-catalogue.api"

export const permissionCatalogueQueryOptions = () =>
  queryOptions({
    queryKey: ["roles", "permission-catalogue"],
    queryFn: () => getPermissionCatalogue(),
    staleTime: 1000 * 60 * 15, // Cache 15 minutes
  })
