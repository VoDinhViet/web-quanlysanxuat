import { queryOptions } from "@tanstack/react-query"

import { getOutsourcingReceipt } from "@/features/outsourcing-receipts/api/server-functions/get-outsourcing-receipt.api"

export const outsourcingReceiptQueryOptions = (outsourcingReceiptId: string) =>
  queryOptions({
    queryKey: ["outsourcing-receipts", "detail", outsourcingReceiptId],
    queryFn: () => getOutsourcingReceipt({ data: { outsourcingReceiptId } }),
  })
