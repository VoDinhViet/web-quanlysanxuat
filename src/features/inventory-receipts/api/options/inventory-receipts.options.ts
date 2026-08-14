import { queryOptions } from "@tanstack/react-query"

import { getInventoryReceipts } from "@/features/inventory-receipts/api/server-functions/get-inventory-receipts.api"
import type { InventoryReceiptsSearchSchema } from "@/features/inventory-receipts/schemas/inventory-receipts-search.schema"

export const inventoryReceiptsQueryOptions = (
  search: InventoryReceiptsSearchSchema
) =>
  queryOptions({
    queryKey: ["inventory-receipts", "list", search],
    queryFn: () => getInventoryReceipts({ data: search }),
  })
