import { queryOptions } from "@tanstack/react-query"

import { getSupplierGroups } from "@/features/suppliers/api/server-functions/get-supplier-groups.api"

export const supplierGroupOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["suppliers", "group-options"],
    queryFn: () => getSupplierGroups(),
    staleTime: 5 * 60_000,
  })
