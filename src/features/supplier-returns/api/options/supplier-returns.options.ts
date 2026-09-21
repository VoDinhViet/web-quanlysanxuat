import { queryOptions } from "@tanstack/react-query"

import { getSupplierReturns } from "@/features/supplier-returns/api/server-functions/get-supplier-returns.api"
import type { SupplierReturnsSearchSchema } from "@/features/supplier-returns/schemas/supplier-returns-search.schema"

export const supplierReturnsQueryOptions = (
  search: SupplierReturnsSearchSchema
) =>
  queryOptions({
    queryKey: ["supplier-returns", "list", search],
    queryFn: () => getSupplierReturns({ data: search }),
  })
