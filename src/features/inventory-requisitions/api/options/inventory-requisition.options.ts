import { queryOptions } from "@tanstack/react-query"

import { getInventoryRequisition } from "@/features/inventory-requisitions/api/server-functions/get-inventory-requisition.api"

export const inventoryRequisitionQueryOptions = (requisitionId: string) =>
  queryOptions({
    queryKey: ["inventory-requisitions", "detail", requisitionId],
    queryFn: () => getInventoryRequisition({ data: { requisitionId } }),
  })
