import { queryOptions } from "@tanstack/react-query"

import { getSupplierStats } from "@/features/suppliers/api/server-functions/get-supplier-stats.api"

export const supplierStatsQueryOptions = () =>
  queryOptions({
    queryKey: ["suppliers", "stats"],
    queryFn: () => getSupplierStats(),
  })
