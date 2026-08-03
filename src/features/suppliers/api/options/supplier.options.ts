import { queryOptions } from "@tanstack/react-query"

import { getSupplier } from "@/features/suppliers/api/server-functions/get-supplier.api"

export const supplierQueryOptions = (supplierId: string) =>
  queryOptions({
    queryKey: ["suppliers", "detail", supplierId],
    queryFn: () => getSupplier({ data: { supplierId } }),
  })
