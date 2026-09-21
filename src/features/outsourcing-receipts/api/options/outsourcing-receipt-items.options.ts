import { queryOptions } from "@tanstack/react-query"

import { getOutsourcingReceiptItems } from "@/features/outsourcing-receipts/api/server-functions/get-outsourcing-receipt-items.api"

export const outsourcingReceiptItemsQueryOptions = (
  outsourcingReceiptId: string
) =>
  queryOptions({
    queryKey: ["outsourcing-receipts", "detail", outsourcingReceiptId, "items"],
    queryFn: () =>
      getOutsourcingReceiptItems({ data: { outsourcingReceiptId } }),
  })
