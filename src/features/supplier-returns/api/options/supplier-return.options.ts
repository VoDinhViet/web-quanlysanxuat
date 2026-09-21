import { queryOptions } from "@tanstack/react-query"

import { getSupplierReturn } from "@/features/supplier-returns/api/server-functions/get-supplier-return.api"

export const supplierReturnQueryOptions = (supplierReturnId: string) =>
  queryOptions({
    queryKey: ["supplier-returns", "detail", supplierReturnId],
    queryFn: () => getSupplierReturn({ data: { supplierReturnId } }),
  })
