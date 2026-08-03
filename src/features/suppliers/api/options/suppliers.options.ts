import { queryOptions } from "@tanstack/react-query"

import { getSuppliers } from "@/features/suppliers/api/server-functions/get-suppliers.api"
import type { SuppliersSearchSchema } from "@/features/suppliers/schemas/suppliers-search.schema"

export const suppliersQueryOptions = (search: SuppliersSearchSchema) =>
  queryOptions({
    queryKey: ["suppliers", "list", search],
    queryFn: () => getSuppliers({ data: search }),
  })
