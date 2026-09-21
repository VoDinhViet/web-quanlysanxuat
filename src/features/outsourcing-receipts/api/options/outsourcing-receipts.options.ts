import { queryOptions } from "@tanstack/react-query"

import { getOutsourcingReceipts } from "@/features/outsourcing-receipts/api/server-functions/get-outsourcing-receipts.api"
import type { OutsourcingReceiptsSearchSchema } from "@/features/outsourcing-receipts/schemas/outsourcing-receipts-search.schema"

export const outsourcingReceiptsQueryOptions = (
  search: OutsourcingReceiptsSearchSchema
) =>
  queryOptions({
    queryKey: ["outsourcing-receipts", "list", search],
    queryFn: () => getOutsourcingReceipts({ data: search }),
  })
